import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Skema validasi untuk update produk (opsional, tapi praktik yang baik)
const productUpdateSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  unit: z.string().min(1, 'Satuan unit wajib diisi'),
  categoryId: z.string().cuid('Kategori tidak valid'),
  buyPrice: z.coerce.number().min(0, 'Harga beli tidak valid'),
  sellPrice: z.coerce.number().min(0, 'Harga jual tidak valid'),
  minStock: z.coerce.number().int().min(0, 'Stok minimum tidak valid'),
  description: z.string().optional(),
});


/**
 * Handler untuk GET (Mengambil satu produk berdasarkan ID)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: id },
    });

    if (!product) {
      return NextResponse.json({ message: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Handler untuk PUT (Update/Edit produk)
 */
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
    console.error(`Error updating product with id ${id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Handler untuk DELETE (Menghapus produk)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.product.delete({
      where: { id: id },
    });
    return new NextResponse(null, { status: 204 }); // 204 No Content

  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return new NextResponse(
        'Tidak dapat menghapus produk karena sudah terikat dengan data lain (misalnya transaksi).',
        { status: 409 } // 409 Conflict
      );
    }

    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}