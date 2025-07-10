// src/app/api/suppliers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const supplierSchema = z.object({
  name: z.string().min(3, 'Nama supplier minimal 3 karakter'),
  contact: z.string().min(10, 'Nomor kontak minimal 10 digit'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
});

// Handler untuk GET (Mengambil semua supplier)
export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(suppliers);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handler untuk POST (Membuat supplier baru)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = supplierSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const { name, contact, email, address } = validation.data;

    const newSupplier = await prisma.supplier.create({
      data: { name, contact, email, address },
    });

    return NextResponse.json(newSupplier, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new NextResponse('Supplier dengan nama atau email ini sudah ada.', { status: 409 });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
