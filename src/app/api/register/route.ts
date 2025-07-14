// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import VerificationEmail from '@/components/emails/VerificationEmail';
import { randomUUID } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    // Validasi input dasar
    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    // Buat token verifikasi
    const verificationToken = randomUUID();
    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 jam

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;

    // Kirim email verifikasi menggunakan Resend
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Ganti dengan email dari domain terverifikasi Anda
      to: email,
      subject: 'Verifikasi Email Anda - Toko Oli UD Double M',
      react: VerificationEmail({ verificationUrl }),
    });

    return NextResponse.json({ message: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi.' }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}