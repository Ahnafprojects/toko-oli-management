import { redirect } from 'next/navigation';

export default function HomePage() {
  // Langsung arahkan pengguna ke halaman kasir
  redirect('/pos'); // <-- Diubah ke sini

  // Tidak perlu merender apapun karena sudah dialihkan
  return null;
}