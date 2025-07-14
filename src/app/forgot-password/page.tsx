// src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email('Format email tidak valid.'),
});

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setMessage('');
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Gagal mengirim email reset.');

      setMessage('Jika email Anda terdaftar, Anda akan menerima link untuk mereset password.');
      form.reset();
    } catch (error) {
      setMessage('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Lupa Password</CardTitle>
              <CardDescription>Masukkan email Anda untuk menerima link reset password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {message && <p className="text-center text-sm p-3 bg-blue-50 text-blue-800 rounded-md">{message}</p>}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="contoh@email.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
              </Button>
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                Kembali ke Login
              </Link>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}