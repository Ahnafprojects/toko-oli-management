// src/app/api/stock-history/route.ts

import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Mengambil parameter 'from' dan 'to' dari URL
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  // Membuat kondisi filter tanggal
  const dateFilter = from && to
    ? {
        createdAt: {
          gte: new Date(from), // gte = greater than or equal to
          lte: new Date(to),   // lte = less than or equal to
        },
      }
    : {};

  try {
    const stockMovements = await prisma.stockMovement.findMany({
      where: {
        ...dateFilter, // Terapkan filter tanggal di sini
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: {
          select: {
            name: true,
            unit: true,
          },
        },
      },
    });

    return NextResponse.json(stockMovements);

  } catch (error) {
    console.error("Error fetching stock history:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}