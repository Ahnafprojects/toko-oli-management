// src/lib/auth.ts

import { AuthOptions, User } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        // --- PENGECEKAN BARU DI SINI ---
        // Jika kolom emailVerified masih kosong (null), jangan izinkan login.
        if (!user.emailVerified) {
          // Melempar error ini akan menghentikan proses dan bisa ditangkap di halaman login
          // untuk menampilkan pesan yang lebih spesifik jika Anda mau.
          // Untuk sekarang, ini akan menghasilkan error login umum.
          throw new Error("Email belum diverifikasi. Silakan cek kotak masuk Anda.");
        }
        // ------------------------------------

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          return null;
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as 'ADMIN' | 'MANAGER' | 'KASIR';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};