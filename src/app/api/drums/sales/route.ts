import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
// Impor 'PaymentMethod' langsung dari Prisma Client
import { Prisma, PaymentMethod } from '@prisma/client';

// Menggunakan enum asli dari Prisma untuk validasi
const drumSaleSchema = z.object({
  productId: z.string().cuid(),
  quantitySoldMl: z.coerce.number().int().positive('Jumlah harus lebih dari 0'),
  salePrice: z.coerce.number().min(0, 'Harga jual tidak valid'),
  userId: z.string().cuid(),
  paymentMethod: z.nativeEnum(PaymentMethod).default('Tunai'), // <-- PERBAIKAN FINAL
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = drumSaleSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const { productId, quantitySoldMl, salePrice, userId, paymentMethod, notes } = validation.data;

    await prisma.$transaction(async (tx) => {
      // 1. Ambil data drum
      const drum = await tx.product.findUnique({ where: { id: productId } });

      if (!drum || !drum.isDrum || drum.currentVolumeMl === null) {
        throw new Error('Produk drum tidak valid.');
      }
      if (drum.currentVolumeMl < quantitySoldMl) {
        throw new Error(`Stok tidak mencukupi. Sisa volume: ${drum.currentVolumeMl} ml.`);
      }

      // 2. Kurangi volume drum
      await tx.product.update({
        where: { id: productId },
        data: { currentVolumeMl: { decrement: quantitySoldMl } },
      });

      // 3. Buat transaksi utama
      const newTransaction = await tx.transaction.create({
        data: {
          invoiceNumber: `INV-DRUM-${Date.now()}`,
          totalAmount: salePrice,
          paidAmount: salePrice,
          paymentMethod: paymentMethod,
          userId: userId,
        },
      });

      // 4. Catat penjualan eceran
      await tx.drumSale.create({
        data: {
          transactionId: newTransaction.id,
          productId,
          quantitySoldMl,
          salePrice: new Prisma.Decimal(salePrice),
          userId,
          notes,
        },
      });
    });

    return NextResponse.json({ message: 'Penjualan drum berhasil dicatat' }, { status: 201 });

  } catch (error: any) {
    console.error("Drum sale failed:", error);
    return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
  }
}