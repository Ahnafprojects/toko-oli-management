// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Langsung arahkan pengguna ke halaman dashboard
  // Middleware akan menangani jika pengguna belum login
  redirect('/dashboard');

  // Tidak perlu merender apapun karena sudah dialihkan
  return null;
}
