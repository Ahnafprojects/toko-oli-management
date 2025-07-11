// src/app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Kita tidak memanggil database, hanya mengembalikan JSON sederhana untuk tes.
  return NextResponse.json({
    message: `Tes sukses! ID produk yang diterima adalah: ${id}`,
  });
}