// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';
import ResetPasswordEmail from '@/components/emails/ResetPasswordEmail'; // Kita akan buat ini
import { randomUUID } from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email diperlukan' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // PENTING: Jangan beritahu jika user ada atau tidak untuk keamanan.
    // Selalu kembalikan respons sukses agar tidak bisa dipakai untuk menebak email.
    if (user) {
      const token = randomUUID();
      const expires = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 jam

      // Kita bisa menggunakan kembali tabel VerificationToken dari NextAuth
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
      
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Reset Password Akun Toko Oli Anda',
        react: ResetPasswordEmail({ resetUrl }),
      });
    }

    return NextResponse.json({ message: 'Jika email terdaftar, link reset telah dikirim.' });
  } catch (error) {
    console.error(error);
    // Kembalikan respons sukses bahkan jika terjadi error internal
    return NextResponse.json({ message: 'Jika email terdaftar, link reset telah dikirim.' });
  }
}