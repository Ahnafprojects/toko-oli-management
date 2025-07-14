// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Skema validasi harus cocok dengan yang ada di backend
const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter.'),
  email: z.string().email('Format email tidak valid.'),
  password: z.string().min(6, 'Password minimal 6 karakter.'),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: RegisterValues) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data), // Kirim data yang sudah divalidasi
      });

      const result = await response.json();

      if (!response.ok) {
        // Jika ada error dari server (misal: email sudah ada)
        throw new Error(result.message || 'Terjadi kesalahan saat registrasi.');
      }
      
      // Jika berhasil
      setSuccess('Registrasi berhasil! Silakan cek email Anda untuk verifikasi.');
      form.reset(); // Kosongkan form

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Buat Akun Baru</CardTitle>
          <CardDescription>Daftar untuk mulai mengelola toko Anda.</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Tampilkan pesan sukses atau error di sini */}
          {success && <p className="text-green-600 bg-green-50 p-3 rounded-md text-center mb-4">{success}</p>}
          {error && <p className="text-red-600 bg-red-50 p-3 rounded-md text-center mb-4">{error}</p>}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contoh@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Minimal 6 karakter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Mendaftarkan...' : 'Daftar'}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600 justify-center">
          <p>
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Login di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}