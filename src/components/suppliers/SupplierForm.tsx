'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Supplier } from "@prisma/client";

// Skema Zod yang sudah diperbaiki
const formSchema = z.object({
  name: z.string().min(3, 'Nama supplier minimal 3 karakter'),
  contact: z.string().min(5, 'Kontak tidak valid'),
  email: z.string().email('Email tidak valid').nullable().optional(),
  address: z.string().nullable().optional(),
});

interface SupplierFormProps {
  initialData?: Supplier | null;
}

export default function SupplierForm({ initialData }: SupplierFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: initialData?.name || "",
        contact: initialData?.contact || "",
        email: initialData?.email || "",
        address: initialData?.address || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Mengubah string kosong menjadi null agar konsisten dengan database
      const dataToSend = {
          ...values,
          email: values.email || null,
          address: values.address || null,
      };

      const url = isEditMode ? `/api/suppliers/${initialData?.id}` : '/api/suppliers';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Gagal ${isEditMode ? 'memperbarui' : 'menambah'} supplier.`);
      }
      
      alert(`Supplier berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
      router.push('/suppliers');
      router.refresh();
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Supplier' : 'Tambah Supplier Baru'}</CardTitle>
            <CardDescription>Isi detail supplier di bawah ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField name="name" render={({ field }) => ( <FormItem> <FormLabel>Nama Supplier</FormLabel> <FormControl><Input placeholder="Contoh: PT Sumber Jaya" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField name="contact" render={({ field }) => ( <FormItem> <FormLabel>Kontak (HP/Telepon)</FormLabel> <FormControl><Input placeholder="Contoh: 08123456789" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField name="email" render={({ field }) => ( <FormItem> <FormLabel>Email (Opsional)</FormLabel> <FormControl><Input type="email" placeholder="Contoh: info@sumberjaya.com" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
            <FormField name="address" render={({ field }) => ( <FormItem> <FormLabel>Alamat (Opsional)</FormLabel> <FormControl><Textarea placeholder="Alamat lengkap supplier..." {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}