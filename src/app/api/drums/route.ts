// src/app/api/drums/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Mengambil semua produk yang ditandai sebagai drum
export async function GET() {
  try {
    const drums = await prisma.product.findMany({
      where: { isDrum: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(drums);
  } catch (error) {
    console.error("Error fetching drums:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
