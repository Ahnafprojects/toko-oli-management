// src/types/next-auth.d.ts
import { Role } from '@prisma/client';
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

// Deklarasikan modul untuk memperluas tipe bawaan NextAuth
declare module 'next-auth' {
  /**
   * Tipe Session yang diperluas
   * Menambahkan 'id' dan 'role' ke objek user di dalam session
   */
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }

  /**
   * Tipe User yang diperluas
   * Menambahkan 'role' ke objek user
   */
  interface User extends DefaultUser {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Tipe JWT yang diperluas
   * Menambahkan 'id' dan 'role' ke token
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
  }
}
