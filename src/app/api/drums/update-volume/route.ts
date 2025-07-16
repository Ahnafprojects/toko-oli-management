import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const updateVolumeSchema = z.object({
  productId: z.string().min(1, 'ID Produk tidak valid.'),
  newVolume: z.coerce.number().min(0, 'Volume baru tidak valid.'),
});

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Tidak terotentikasi' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const validation = updateVolumeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.flatten().fieldErrors, { status: 400 });
    }

    const { productId, newVolume } = validation.data;

    // Gunakan transaksi untuk memastikan kedua operasi (update dan pencatatan) berhasil
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ambil data produk saat ini untuk perbandingan
      const currentProduct = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!currentProduct) {
        throw new Error('Produk drum tidak ditemukan.');
      }

      // 2. Perbarui volume produk
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentVolumeMl: newVolume },
      });

      // 3. Buat catatan pergerakan stok sebagai 'ADJUSTMENT'
      const oldVolume = currentProduct.currentVolumeMl ?? 0;
      const volumeChange = newVolume - oldVolume; // Bisa positif (penambahan) atau negatif (pengurangan)

      // Hanya catat jika ada perubahan
      if (volumeChange !== 0) {
        await tx.stockMovement.create({
          data: {
            productId: productId,
            type: 'ADJUSTMENT',
            quantity: volumeChange,
            notes: `Volume diubah dari ${oldVolume}ml menjadi ${newVolume}ml oleh ${session.user.name || session.user.email}`,
          },
        });
      }

      return updatedProduct;
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Gagal update volume drum:", error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}