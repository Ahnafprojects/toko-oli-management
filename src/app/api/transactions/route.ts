// src/app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { PaymentMethod, Prisma } from '@prisma/client';

const cartItemSchema = z.object({
  id: z.string(),
  quantity: z.number().min(1),
  sellPrice: z.any(),
  isDrumSale: z.boolean().optional(),
  originalProductId: z.string().optional(),
  quantitySoldMl: z.number().optional(),
});

const transactionSchema = z.object({
  cart: z.array(cartItemSchema).min(1, { message: "Keranjang tidak boleh kosong." }),
  totalAmount: z.number(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paidAmount: z.number(),
  userId: z.string().cuid({ message: "Sesi pengguna tidak valid." }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = transactionSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ message: validation.error.errors[0].message }), { status: 400 });
    }

    const { cart, totalAmount, paymentMethod, paidAmount, userId } = validation.data;

    // --- LANGKAH DEBUGGING ---
    // Cetak ID pengguna yang diterima oleh server ke terminal
    console.log(`Mencoba membuat transaksi untuk userId: ${userId}`);

    // PERBAIKAN: Verifikasi pengguna SEBELUM memulai transaksi database
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      // Jika pengguna tidak ada, kirim pesan eror yang jelas
      console.error(`Pengguna dengan ID "${userId}" tidak ditemukan di database.`);
      return new NextResponse(JSON.stringify({ message: `Pengguna dengan ID "${userId}" tidak ditemukan. Coba logout dan login kembali.` }), { status: 404 });
    }

    // Jika pengguna ada, lanjutkan dengan transaksi
    const transactionResult = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          userId,
          totalAmount,
          paidAmount,
          changeAmount: paidAmount - totalAmount,
          paymentMethod,
          invoiceNumber: `INV-${Date.now()}`,
        },
      });

      for (const item of cart) {
        if (item.isDrumSale && item.originalProductId && item.quantitySoldMl) {
          const drum = await tx.product.findUnique({ where: { id: item.originalProductId } });
          if (!drum || (drum.currentVolumeMl ?? 0) < item.quantitySoldMl) throw new Error(`Stok untuk ${drum?.name || 'drum'} tidak mencukupi.`);
          await tx.product.update({
            where: { id: item.originalProductId },
            data: { currentVolumeMl: { decrement: item.quantitySoldMl } },
          });
          await tx.drumSale.create({
            data: {
              transactionId: newTransaction.id,
              productId: item.originalProductId,
              quantitySoldMl: item.quantitySoldMl,
              salePrice: new Prisma.Decimal(item.sellPrice),
              userId,
            },
          });
        } else {
          const product = await tx.product.findUnique({ where: { id: item.id } });
          if (!product || product.stock < item.quantity) throw new Error(`Stok untuk produk ${product?.name || item.id} tidak mencukupi.`);
          await tx.product.update({
            where: { id: item.id },
            data: { stock: { decrement: item.quantity } },
          });
           await tx.transactionItem.create({
            data: {
              transactionId: newTransaction.id,
              productId: item.id,
              quantity: item.quantity,
              price: new Prisma.Decimal(item.sellPrice),
              subtotal: new Prisma.Decimal(item.quantity * Number(item.sellPrice)),
            },
          });
        }
      }
      return newTransaction;
    });

    return NextResponse.json(transactionResult, { status: 201 });
  } catch (error: any) {
    console.error("Transaction failed:", error);
    return new NextResponse(JSON.stringify({ message: error.message || 'Internal Server Error' }), { status: 500 });
  }
}

export async function GET() {
  // ... (Handler GET tetap sama)
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, unit: true } },
          },
        },
        drumSales: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const safeTransactions = transactions.map(t => ({
      ...t,
      totalAmount: t.totalAmount.toNumber(),
      paidAmount: t.paidAmount.toNumber(),
      changeAmount: t.changeAmount.toNumber(),
      discount: t.discount.toNumber(),
      items: t.items.map(item => ({
        ...item,
        price: item.price.toNumber(),
        subtotal: item.subtotal.toNumber(),
      })),
      drumSales: t.drumSales.map(ds => ({
        ...ds,
        salePrice: ds.salePrice.toNumber(),
      })),
    }));

    return NextResponse.json(safeTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
