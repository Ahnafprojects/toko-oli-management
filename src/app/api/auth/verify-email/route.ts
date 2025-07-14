// src/app/api/auth/verify-email/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url));
  }

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || new Date() > verificationToken.expires) {
      return NextResponse.redirect(new URL('/login?error=InvalidOrExpiredToken', request.url));
    }

    // Update status verifikasi pengguna
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Hapus token yang sudah digunakan
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Arahkan ke halaman login dengan pesan sukses
    return NextResponse.redirect(new URL('/login?verified=true', request.url));

  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL('/login?error=VerificationFailed', request.url));
  }
}