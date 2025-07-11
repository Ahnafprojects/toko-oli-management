// src/app/api/products/[id]/route.ts

// 1. IMPOR YANG DIBUTUHKAN
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// 2. SKEMA VALIDASI (jika Anda menggunakannya untuk PUT)
const productUpdateSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  unit: z.string().min(1, 'Satuan unit wajib diisi'),
  categoryId: z.string().cuid('Kategori tidak valid'),
  buyPrice: z.coerce.number().min(0, 'Harga beli tidak valid'),
  sellPrice: z.coerce.number().min(0, 'Harga jual tidak valid'),
  minStock: z.coerce.number().int().min(0, 'Stok minimum tidak valid'),
  description: z.string().optional(),
});

// 3. HANDLER UNTUK GET
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// 4. HANDLER UNTUK PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body = await request.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const { name, unit, categoryId, buyPrice, sellPrice, minStock, description } = validation.data;

    const updatedProduct = await prisma.product.update({
      where: { id },
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
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// 5. HANDLER UNTUK DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.product.delete({
      where: { id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new NextResponse('Tidak dapat menghapus produk karena terikat dengan transaksi.', { status: 409 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}