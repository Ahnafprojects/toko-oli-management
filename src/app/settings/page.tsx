'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import toast, { Toaster } from 'react-hot-toast';
import { useState } from 'react';

// Schema
const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Konfirmasi password tidak cocok',
  path: ['confirmPassword'],
});

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: session?.user?.name || '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    const promise = fetch('/api/settings/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    }).then(async (res) => {
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Menyimpan profil...',
      success: () => {
        updateSession({ name: values.name });
        return 'Profil berhasil diperbarui!';
      },
      error: 'Gagal memperbarui profil.',
    });
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    const promise = fetch('/api/settings/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    }).then(async (res) => {
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Terjadi kesalahan');
      return result;
    });

    toast.promise(promise, {
      loading: 'Mengubah password...',
      success: (data) => {
        passwordForm.reset();
        return data.message || 'Password berhasil diubah!';
      },
      error: (err) => err.toString(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <Toaster />
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Pengaturan Akun</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Profil */}
          <Card className="shadow-md border border-gray-200 bg-white">
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardHeader>
                  <CardTitle>Profil Pengguna</CardTitle>
                  <CardDescription>Perbarui nama dan informasi Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    name="name"
                    control={profileForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <Input value={session?.user?.email || ''} disabled />
                  </FormItem>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                    Simpan Perubahan Profil
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Form Password */}
          <Card className="shadow-md border border-gray-200 bg-white">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardHeader>
                  <CardTitle>Ubah Password</CardTitle>
                  <CardDescription>Gunakan password yang kuat dan aman.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Password saat ini */}
                  <FormField
                    name="currentPassword"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password Saat Ini</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={show.current ? 'text' : 'password'}
                              {...field}
                              className="pr-10"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShow(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {show.current ? '🙈' : '👁️'}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password baru */}
                  <FormField
                    name="newPassword"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password Baru</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={show.new ? 'text' : 'password'}
                              {...field}
                              className="pr-10"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShow(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {show.new ? '🙈' : '👁️'}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Konfirmasi password */}
                  <FormField
                    name="confirmPassword"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konfirmasi Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={show.confirm ? 'text' : 'password'}
                              {...field}
                              className="pr-10"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShow(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {show.confirm ? '🙈' : '👁️'}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                    Ubah Password
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
