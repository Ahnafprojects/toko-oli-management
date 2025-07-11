import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Mendefinisikan tipe untuk parameter kedua secara eksplisit
type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, context: RouteContext) {
  // Mengambil id dari context.params
  const id = context.params.id;

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