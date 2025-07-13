// src/app/api/suppliers/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const supplierSchema = z.object({
  name: z.string().min(3, 'Nama supplier minimal 3 karakter'),
  contact: z.string().min(5, 'Kontak tidak valid'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
});

// Fungsi untuk UPDATE (PUT)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validation = supplierSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: params.id },
      data: validation.data,
    });

    return NextResponse.json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Fungsi untuk DELETE
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Periksa apakah supplier terikat dengan pembelian
    const purchaseCount = await prisma.purchase.count({
      where: { supplierId: params.id },
    });

    if (purchaseCount > 0) {
      return new NextResponse(
        'Tidak dapat menghapus supplier karena sudah memiliki riwayat pembelian.',
        { status: 409 } // 409 Conflict
      );
    }

    await prisma.supplier.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}