// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // Impor dari file baru

const handler = NextAuth(authOptions);

// Hanya ekspor handler untuk GET dan POST
export { handler as GET, handler as POST };
