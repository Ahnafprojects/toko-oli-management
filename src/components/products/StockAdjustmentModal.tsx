// src/components/products/StockAdjustmentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Product, StockMovementType } from '@prisma/client';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

const adjustmentSchema = z.object({
  newStock: z.coerce.number().int().min(0, "Stok tidak boleh negatif."),
  type: z.nativeEnum(StockMovementType, { required_error: "Tipe harus dipilih." }),
  notes: z.string().min(3, "Catatan wajib diisi, min. 3 karakter."),
});

export default function StockAdjustmentModal({ isOpen, onClose, product, onSuccess }: StockAdjustmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof adjustmentSchema>>({
    resolver: zodResolver(adjustmentSchema),
  });

  useEffect(() => {
    if (product) {
      form.reset({ newStock: product.stock, notes: '' });
    }
  }, [product, form]);

  async function onSubmit(values: z.infer<typeof adjustmentSchema>) {
    if (!product) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, productId: product.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyesuaikan stok.');
      }
      alert('Stok berhasil diperbarui!');
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Penyesuaian Stok: {product.name}</DialogTitle>
          <DialogDescription>
            Stok saat ini: <span className="font-bold">{product.stock}</span> {product.unit}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="newStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Stok Baru</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Penyesuaian</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe pergerakan stok" />
                      </SelectTrigger>
                    </FormControl>
                    {/* PERBAIKAN: Menambahkan kelas bg-white */}
                    <SelectContent className="bg-white">
                      <SelectItem value={StockMovementType.IN}>Stok Masuk</SelectItem>
                      <SelectItem value={StockMovementType.OUT}>Stok Keluar</SelectItem>
                      <SelectItem value={StockMovementType.ADJUSTMENT}>Koreksi (Opname)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan/Alasan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Contoh: Barang masuk dari Supplier X" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Penyesuaian'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
