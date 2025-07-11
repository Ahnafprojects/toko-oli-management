'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SafeProductForForm } from "@/app/products/edit/[id]/page";

const formatRupiah = (angka: number | string | undefined): string => {
  if (angka === undefined || angka === null) return '';
  const number_string = String(angka).replace(/[^,\d]/g, '');
  const sisa = number_string.length % 3;
  let rupiah = number_string.substr(0, sisa);
  const ribuan = number_string.substr(sisa).match(/\d{3}/gi);
  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }
  return rupiah || '';
};

const parseRupiah = (rupiah: string): number => {
  return Number(String(rupiah).replace(/[^0-9]/g, ''));
};

const formSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  unit: z.string().min(1, 'Satuan unit wajib diisi'),
  categoryId: z.string({ required_error: "Kategori harus dipilih." }),
  buyPrice: z.coerce.number().min(0, 'Harga beli tidak valid'),
  sellPrice: z.coerce.number().min(0, 'Harga jual tidak valid'),
  stock: z.coerce.number().int().min(0, 'Stok tidak valid').optional(),
  minStock: z.coerce.number().int().min(0, 'Stok minimum tidak valid'),
  description: z.string().nullable().optional(),
  isDrum: z.boolean().default(false),
  // <-- PERBAIKAN FINAL: Tambahkan .nullable() di sini
  initialVolumeMl: z.coerce.number().nullable().optional(),
}).refine(data => !data.isDrum || (data.initialVolumeMl && data.initialVolumeMl > 0), {
    message: "Volume awal wajib diisi untuk produk drum",
    path: ["initialVolumeMl"],
});

interface ProductFormProps {
  categories: Category[];
  initialData?: SafeProductForForm | null;
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayBuyPrice, setDisplayBuyPrice] = useState('');
  const [displaySellPrice, setDisplaySellPrice] = useState('');

  const isEditMode = !!initialData;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      unit: "",
      categoryId: "",
      buyPrice: 0,
      sellPrice: 0,
      stock: 0,
      minStock: 5,
      description: "",
      isDrum: false,
      initialVolumeMl: 0,
    },
  });

  useEffect(() => {
    if (isEditMode && initialData) {
      const dataForForm = {
        ...initialData,
        description: initialData.description ?? "",
        initialVolumeMl: initialData.initialVolumeMl ?? 0,
      };
      form.reset(dataForForm);
      setDisplayBuyPrice(formatRupiah(initialData.buyPrice));
      setDisplaySellPrice(formatRupiah(initialData.sellPrice));
    }
  }, [isEditMode, initialData, form]);

  const isDrum = form.watch('isDrum');

  useEffect(() => {
    if (!isEditMode && isDrum) {
      form.setValue('unit', 'Drum');
      form.setValue('stock', 1);
    }
  }, [isDrum, isEditMode, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const payload = isEditMode
        ? {
            name: values.name,
            unit: values.unit,
            categoryId: values.categoryId,
            buyPrice: values.buyPrice,
            sellPrice: values.sellPrice,
            minStock: values.minStock,
            description: values.description,
          }
        : values;

      const url = isEditMode ? `/api/products/${initialData?.id}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Gagal menyimpan produk. Periksa kembali data Anda.";
        if (errorData) {
          if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            const firstError = Object.values(errorData).find(
               (field: any) => field?._errors?.length > 0
            ) as { _errors: string[] } | undefined;
            if (firstError) {
                errorMessage = firstError._errors[0];
            }
          }
        }
        throw new Error(errorMessage);
      }
      
      alert(`Produk berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}!`);
      router.push('/products');
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
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Detail Produk' : 'Detail Produk Baru'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="isDrum"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Produk Drum?</FormLabel>
                    <FormDescription>
                      Aktifkan jika produk ini adalah drum yang akan dijual eceran.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isEditMode}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="name" render={({ field }) => ( <FormItem> <FormLabel>Nama Produk</FormLabel> <FormControl><Input placeholder="Contoh: Oli Pertamina Drum #1" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField name="categoryId" render={({ field }) => ( <FormItem> <FormLabel>Kategori</FormLabel> <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger></FormControl> <SelectContent className="bg-white">{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent> </Select> <FormMessage /> </FormItem> )} />
              
              {isDrum ? (
                <>
                  <FormField name="initialVolumeMl" render={({ field }) => ( <FormItem> <FormLabel>Volume Awal (ml)</FormLabel> <FormControl><Input type="number" placeholder="Contoh: 209000" {...field} value={field.value ?? 0} disabled={isEditMode} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField name="unit" render={({ field }) => ( <FormItem> <FormLabel>Satuan Unit</FormLabel> <FormControl><Input {...field} readOnly /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField name="stock" render={({ field }) => ( <FormItem> <FormLabel>Jumlah Drum</FormLabel> <FormControl><Input type="number" {...field} value={field.value ?? 0} disabled={isEditMode} /></FormControl> <FormMessage /> </FormItem> )} />
                </>
              ) : (
                <>
                  <FormField name="unit" render={({ field }) => ( <FormItem> <FormLabel>Satuan Unit</FormLabel> <FormControl><Input placeholder="Contoh: Botol, Liter" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  <FormField name="stock" render={({ field }) => ( <FormItem> <FormLabel>Stok Awal</FormLabel> <FormControl><Input type="number" placeholder="Contoh: 24" {...field} value={field.value ?? 0} disabled={isEditMode} /></FormControl> <FormDescription>Stok hanya bisa diubah melalui menu Penyesuaian Stok.</FormDescription> <FormMessage /> </FormItem> )} />
                </>
              )}

              <FormField name="buyPrice" render={({ field }) => ( <FormItem> <FormLabel>Harga Beli (per Satuan)</FormLabel> <FormControl><Input type="text" value={displayBuyPrice} onChange={(e) => { setDisplayBuyPrice(formatRupiah(e.target.value)); field.onChange(parseRupiah(e.target.value)); }} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField name="sellPrice" render={({ field }) => ( <FormItem> <FormLabel>Harga Jual (per Satuan)</FormLabel> <FormControl><Input type="text" value={displaySellPrice} onChange={(e) => { setDisplaySellPrice(formatRupiah(e.target.value)); field.onChange(parseRupiah(e.target.value)); }} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField name="minStock" render={({ field }) => ( <FormItem> <FormLabel>Stok Minimum</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField name="description" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Deskripsi</FormLabel> <FormControl><Textarea placeholder="Catatan tambahan..." {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}