'use client';

import { useState } from 'react';
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
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = async (data: LoginValues) => {
    setError(null);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg border border-gray-200 rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">Login</CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-1">
            Masuk ke akun Anda untuk mulai mengelola toko oli
          </CardDescription>
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-10.5-7.5a10.08 10.08 0 011.986-3.272m3.127-2.63A9.967 9.967 0 0112 5c5 0 9.27 3.11 10.5 7.5a10.08 10.08 0 01-2.089 3.49m-1.86 1.645L4.22 4.22"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 01-3 3m0-6a3 3 0 013 3m0 0a3 3 0 00-3-3m0 0a3 3 0 003 3m6 0a10 10 0 01-18 0 10 10 0 0118 0z"
                      />
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
              {isSubmitting ? 'Loading...' : 'Login'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link href="/register" className="text-blue-600 hover:underline ml-1">
            Daftar di sini
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
