// src/app/api/settings/change-password/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
});

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Tidak terotentikasi' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = passwordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const { currentPassword, newPassword } = validation.data;

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.password) {
      return NextResponse.json({ message: 'Akun tidak memiliki password.' }, { status: 400 });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Password saat ini salah.' }, { status: 401 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ message: 'Password berhasil diperbarui.' });
  } catch (error) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}