// src/components/auth/ErrorCard.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

const errorMessages: { [key: string]: string } = {
  CredentialsSignin: 'Email atau password yang Anda masukkan salah.',
  'Email belum diverifikasi. Silakan cek kotak masuk Anda.': 'Email Anda belum diverifikasi. Silakan cek email yang kami kirimkan.',
  default: 'Terjadi kesalahan saat mencoba login. Silakan coba lagi.',
};

export default function ErrorCard() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = error && (errorMessages[error] || errorMessages.default);

  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="mx-auto bg-red-100 p-3 rounded-full">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <CardTitle className="mt-4 text-2xl font-bold">Terjadi Masalah</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/login">Kembali ke Login</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}