// src/app/reset-password/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
    password: z.string().min(6, 'Password baru minimal 6 karakter'),
    confirmPassword: z.string(),
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
});

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { password: '', confirmPassword: '' },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setError('');
        setMessage('');
        if (!token) {
            setError('Token reset tidak valid atau hilang.');
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password: values.password }),
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal mereset password.');

            setMessage('Password berhasil diubah! Anda akan diarahkan ke halaman login...');
            setTimeout(() => router.push('/login'), 3000);

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader><CardTitle>Reset Password Anda</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {message && <p className="text-green-600">{message}</p>}
                        {error && <p className="text-red-600">{error}</p>}
                        <FormField name="password" render={({ field }) => ( <FormItem> <FormLabel>Password Baru</FormLabel> <FormControl><Input type="password" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField name="confirmPassword" render={({ field }) => ( <FormItem> <FormLabel>Konfirmasi Password Baru</FormLabel> <FormControl><Input type="password" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}

// Gunakan Suspense agar useSearchParams bisa digunakan
export default function ResetPasswordPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    )
}