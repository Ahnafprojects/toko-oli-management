// src/app/api/stock/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { StockMovementType } from '@prisma/client';

const stockAdjustmentSchema = z.object({
  productId: z.string().cuid(),
  newStock: z.coerce.number().int().min(0, "Stok baru tidak boleh negatif."),
  type: z.nativeEnum(StockMovementType),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = stockAdjustmentSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const { productId, newStock, type, notes } = validation.data;

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Produk tidak ditemukan.");
      }

      const currentStock = product.stock;
      const quantityChange = newStock - currentStock;

      if (quantityChange === 0) {
        throw new Error("Tidak ada perubahan stok.");
      }

      // Update stok produk
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      // Catat pergerakan stok
      await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity: Math.abs(quantityChange), // Catat jumlah perubahannya
          notes: `${type === 'ADJUSTMENT' ? 'Penyesuaian' : type === 'IN' ? 'Masuk' : 'Keluar'}: ${quantityChange > 0 ? '+' : ''}${quantityChange}. Catatan: ${notes || ''}`,
        },
      });

      return updatedProduct;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Stock adjustment failed:", error);
    return new NextResponse(JSON.stringify({ message: error.message }), { status: 500 });
  }
}
