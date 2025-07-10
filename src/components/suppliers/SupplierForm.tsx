// src/components/suppliers/SupplierForm.tsx
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(3, 'Nama supplier minimal 3 karakter'),
  contact: z.string().min(10, 'Nomor kontak minimal 10 digit'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
});

export default function SupplierForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", contact: "", email: "", address: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Gagal menyimpan supplier.');
      }
      
      alert('Supplier berhasil ditambahkan!');
      router.push('/suppliers');
      router.refresh();
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Supplier</FormLabel>
                  <FormControl><Input placeholder="Contoh: PT Sejahtera Abadi" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Kontak (HP/Telepon)</FormLabel>
                  <FormControl><Input placeholder="Contoh: 08123456789" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Opsional)</FormLabel>
                  <FormControl><Input type="email" placeholder="Contoh: sales@sejahtera.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat (Opsional)</FormLabel>
                  <FormControl><Textarea placeholder="Masukkan alamat lengkap supplier" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Supplier'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
