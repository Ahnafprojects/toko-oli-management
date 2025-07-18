'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password tidak boleh kosong'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams.get('error') ? 'Email atau password salah.' : null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccessMessage('Email berhasil diverifikasi! Silakan login.');
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginValues) => {
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: '/home',
      });

      if (result?.error) {
        setError('Email atau password yang Anda masukkan salah. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak diketahui.');
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Selamat Datang Kembali</CardTitle>
        <CardDescription>Masuk untuk melanjutkan ke sistem Anda.</CardDescription>
      </CardHeader>

      <CardContent>
        {successMessage && (
          <div className="text-green-700 bg-green-50 border border-green-200 text-sm rounded-lg p-3 text-center mb-4">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 text-sm rounded-lg p-3 text-center mb-4">
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Loading...' : 'Login'}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col items-center text-sm text-gray-600 gap-3 pt-4">
        <p>
          Belum punya akun?{' '}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Daftar di sini
          </Link>
        </p>
        
        {/* --- LINK LUPA PASSWORD BARU --- */}
        <Link href="/forgot-password" className="text-xs text-gray-500 hover:underline">
          Lupa Password?
        </Link>
        {/* ----------------------------- */}
      </CardFooter>
    </Card>
  );
}