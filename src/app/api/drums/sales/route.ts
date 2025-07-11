// src/app/api/drums/sales/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const drumSaleSchema = z.object({
  productId: z.string().cuid(),
  quantitySoldMl: z.coerce.number().int().positive('Jumlah harus lebih dari 0'),
  salePrice: z.coerce.number().min(0, 'Harga jual tidak valid'),
  userId: z.string().cuid(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = drumSaleSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const { productId, quantitySoldMl, salePrice, userId, notes } = validation.data;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data drum saat ini
      const drum = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!drum || !drum.isDrum || drum.currentVolumeMl === null) {
        throw new Error('Produk drum tidak valid.');
      }
      if (drum.currentVolumeMl < quantitySoldMl) {
        throw new Error(`Stok tidak mencukupi. Sisa volume: ${drum.currentVolumeMl} ml.`);
      }

      // 2. Kurangi volume drum
      const updatedDrum = await tx.product.update({
        where: { id: productId },
        data: {
          currentVolumeMl: {
            decrement: quantitySoldMl,
          },
        },
      });

      // <-- 3. BUAT TRANSAKSI UTAMA (INI BAGIAN BARU) -->
      const newTransaction = await tx.transaction.create({
        data: {
          userId: userId,
          totalAmount: salePrice,
          type: 'DRUM_SALE', // Sesuaikan dengan tipe transaksi Anda
          // Anda mungkin perlu menambahkan field lain di sini sesuai skema Transaction
        },
      });

      // <-- 4. CATAT PENJUALAN ECERAN DENGAN TRANSACTION ID (INI BAGIAN YANG DIPERBAIKI) -->
      const newSale = await tx.drumSale.create({
        data: {
          transactionId: newTransaction.id, // <-- Menggunakan ID dari transaksi baru
          productId,
          quantitySoldMl,
          salePrice: new Prisma.Decimal(salePrice),
          userId,
          notes,
        },
      });

      return { updatedDrum, newSale, newTransaction };
    });

    return NextResponse.json(result.newSale, { status: 201 });

  } catch (error: any) {
    console.error("Drum sale failed:", error);
    return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
  }
}