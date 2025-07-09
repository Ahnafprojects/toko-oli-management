// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Skema validasi yang lebih pintar
const productSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  unit: z.string().min(1, 'Satuan unit wajib diisi'),
  categoryId: z.string().cuid('Kategori tidak valid'),
  buyPrice: z.coerce.number().min(0, 'Harga beli tidak valid'),
  sellPrice: z.coerce.number().min(0, 'Harga jual tidak valid'),
  stock: z.coerce.number().int().min(0, 'Stok tidak valid'),
  minStock: z.coerce.number().int().min(0, 'Stok minimum tidak valid'),
  description: z.string().optional(),
  // Kolom baru untuk logika drum
  isDrum: z.boolean().default(false),
  initialVolumeMl: z.coerce.number().int().optional(),
}).refine(data => {
    // Jika isDrum true, maka initialVolumeMl wajib diisi
    if (data.isDrum) {
        return data.initialVolumeMl !== undefined && data.initialVolumeMl > 0;
    }
    return true;
}, {
    message: "Volume awal wajib diisi untuk produk drum",
    path: ["initialVolumeMl"], // Menunjukkan field mana yang error
});


export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    
    const safeProducts = products.map(p => ({
      ...p,
      buyPrice: p.buyPrice.toNumber(),
      sellPrice: p.sellPrice.toNumber(),
    }));
    return NextResponse.json(safeProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify(validation.error.format()), { status: 400 });
    }

    const { name, unit, categoryId, buyPrice, sellPrice, stock, minStock, description, isDrum, initialVolumeMl } = validation.data;

    const newProduct = await prisma.product.create({
      data: {
        name,
        unit,
        categoryId,
        buyPrice: new Prisma.Decimal(buyPrice),
        sellPrice: new Prisma.Decimal(sellPrice),
        stock,
        minStock,
        description,
        isDrum,
        // Jika ini produk drum, atur volume awal dan saat ini
        initialVolumeMl: isDrum ? initialVolumeMl : null,
        currentVolumeMl: isDrum ? initialVolumeMl : null,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return new NextResponse(JSON.stringify({ message: 'Produk dengan nama ini sudah ada.' }), { status: 409 });
    }
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}
