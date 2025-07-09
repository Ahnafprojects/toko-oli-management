// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // Impor dari file baru yang kita buat

// Inisialisasi NextAuth dengan konfigurasi yang sudah dipisah
const handler = NextAuth(authOptions);

// Ekspor handler untuk metode GET dan POST
export { handler as GET, handler as POST };