'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // toggle visibility

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    setError(null);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.text();
        throw new Error(result || 'Gagal mendaftar');
      }

      router.push('/login?success=true');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 px-4">
      <Card className="w-full max-w-md bg-white/90 shadow-xl border border-gray-200 rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Registrasi Akun Baru
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Bergabung dan mulai kelola toko oli Anda
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="contoh@email.com"
                className="h-11 px-4"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Minimal 6 karakter"
                  className="h-11 pr-10 px-4"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-10.5-7.5a10.08 10.08 0 011.986-3.272m3.127-2.63A9.967 9.967 0 0112 5c5 0 9.27 3.11 10.5 7.5a10.08 10.08 0 01-2.089 3.49m-1.86 1.645L4.22 4.22" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 01-3 3m0-6a3 3 0 013 3m0 0a3 3 0 00-3-3m0 0a3 3 0 003 3m6 0a10 10 0 01-18 0 10 10 0 0118 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 bg-red-50 border border-red-200 text-sm rounded-lg p-3">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-md hover:from-blue-700 hover:to-purple-700 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mendaftar...' : 'Daftar'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-600 hover:underline ml-1">
            Login di sini
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
