import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// A schema for validating the data when you update a product.
const productUpdateSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter').optional(),
  unit: z.string().min(1, 'Satuan unit wajib diisi').optional(),
  categoryId: z.string().cuid('Kategori tidak valid').optional(),
  buyPrice: z.coerce.number().min(0, 'Harga beli tidak valid').optional(),
  sellPrice: z.coerce.number().min(0, 'Harga jual tidak valid').optional(),
  minStock: z.coerce.number().int().min(0, 'Stok minimum tidak valid').optional(),
  description: z.string().nullable().optional(),
});

// --- GET (To fetch a single product's details) ---
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true }, // Include category info
    });

    if (!product) {
      return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
    }
    
    // Convert Decimal types to numbers to safely send to the client
    const safeProduct = {
      ...product,
      buyPrice: product.buyPrice.toNumber(),
      sellPrice: product.sellPrice.toNumber(),
    };

    return NextResponse.json(safeProduct);
  } catch (error) {
    console.error(`Error fetching product ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// --- PUT (To update/edit a product) ---
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = productUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const { buyPrice, sellPrice, ...otherData } = validation.data;

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...otherData,
        // Convert prices back to Decimal before saving if they exist
        ...(buyPrice !== undefined && { buyPrice: new Prisma.Decimal(buyPrice) }),
        ...(sellPrice !== undefined && { sellPrice: new Prisma.Decimal(sellPrice) }),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// --- DELETE (To delete a product) ---
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Safety check: Prevent deleting a product with sales history
    const transactionItemCount = await prisma.transactionItem.count({
      where: { productId: params.id },
    });

    if (transactionItemCount > 0) {
      return new NextResponse(
        'Tidak dapat menghapus produk karena sudah memiliki riwayat transaksi.',
        { status: 409 } // 409 Conflict
      );
    }

    // If it's safe, delete the product
    await prisma.product.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 }); // Success, no content
  } catch (error) {
    console.error(`Error deleting product ${params.id}:`, error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}