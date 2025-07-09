// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Skema validasi khusus untuk update produk
// Stok tidak di-update melalui form ini, jadi kita hapus dari skema
const productUpdateSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  unit: z.string().min(1, 'Satuan unit wajib diisi'),
  categoryId: z.string().cuid('Kategori tidak valid'),
  buyPrice: z.coerce.number().min(0, 'Harga beli tidak valid'),
  sellPrice: z.coerce.number().min(0, 'Harga jual tidak valid'),
  minStock: z.coerce.number().int().min(0, 'Stok minimum tidak valid'),
  description: z.string().optional(),
});

// Handler untuk PUT (Update/Edit)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const { name, unit, categoryId, buyPrice, sellPrice, minStock, description } = validation.data;

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        unit,
        categoryId,
        buyPrice: new Prisma.Decimal(buyPrice),
        sellPrice: new Prisma.Decimal(sellPrice),
        minStock,
        description,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}

// Handler untuk DELETE (Hapus)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 }); // 204 No Content
  } catch (error) {
    console.error("Error deleting product:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return new NextResponse('Tidak dapat menghapus produk karena sudah terikat dengan transaksi.', { status: 409 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
