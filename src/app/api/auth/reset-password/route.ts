// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || new Date() > verificationToken.expires) {
      return NextResponse.json({ message: 'Token tidak valid atau sudah kedaluwarsa.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email: verificationToken.identifier }
    });

    if (!user) {
        return NextResponse.json({ message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    // Hapus token yang sudah digunakan
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({ message: 'Password berhasil direset.' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}