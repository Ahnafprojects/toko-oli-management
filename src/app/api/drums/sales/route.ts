import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Skema divalidasi, ditambahkan paymentMethod
const drumSaleSchema = z.object({
  productId: z.string().cuid(),
  quantitySoldMl: z.coerce.number().int().positive('Jumlah harus lebih dari 0'),
  salePrice: z.coerce.number().min(0, 'Harga jual tidak valid'),
  userId: z.string().cuid(),
  paymentMethod: z.enum(['CASH', 'TRANSFER', 'OTHER']).default('CASH'), // Menambahkan metode pembayaran
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = drumSaleSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    // Ambil paymentMethod dari data yang divalidasi
    const { productId, quantitySoldMl, salePrice, userId, paymentMethod, notes } = validation.data;

    const result = await prisma.$transaction(async (tx) => {
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

      // 3. Buat transaksi utama dengan SEMUA field yang dibutuhkan
      const newTransaction = await tx.transaction.create({
        data: {
          // Membuat nomor invoice unik berdasarkan waktu
          invoiceNumber: `INV-DRUM-${Date.now()}`,
          totalAmount: salePrice,
          paidAmount: salePrice, // Asumsi langsung lunas
          paymentMethod: paymentMethod, // Menggunakan data dari request
          userId: userId,
        },
      });

      // 4. Catat penjualan eceran
      const newSale = await tx.drumSale.create({
        data: {
          transactionId: newTransaction.id,
          productId,
          quantitySoldMl,
          salePrice: new Prisma.Decimal(salePrice),
          userId,
          notes,
        },
      });

      return { newSale };
    });

    return NextResponse.json(result.newSale, { status: 201 });

  } catch (error: any) {
    console.error("Drum sale failed:", error);
    return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
  }
}