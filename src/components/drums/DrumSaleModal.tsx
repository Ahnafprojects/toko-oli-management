// src/components/drums/DrumSaleModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Product } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DrumSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  drum: (Omit<Product, 'buyPrice' | 'sellPrice'> & { buyPrice: number; sellPrice: number; }) | null;
  onSuccess: (values: { quantitySoldMl: number; salePrice: number; }) => void;
}

// Helper untuk format angka ke Rupiah dengan titik
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

const saleSchema = z.object({
  quantity: z.coerce.number().positive('Jumlah harus lebih dari 0'),
  unit: z.enum(['ml', 'liter']),
  salePrice: z.coerce.number().min(0, 'Harga jual tidak valid'),
});

export default function DrumSaleModal({ isOpen, onClose, drum, onSuccess }: DrumSaleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displaySalePrice, setDisplaySalePrice] = useState('');
  
  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: { quantity: 0, unit: 'ml', salePrice: 0 },
  });

  useEffect(() => {
    form.reset({ quantity: 0, unit: 'ml', salePrice: 0 });
    setDisplaySalePrice('');
  }, [isOpen, drum, form]);
  
  function onSubmit(values: z.infer<typeof saleSchema>) {
    setIsSubmitting(true);
    try {
        // Konversi kuantitas ke ml jika satuannya liter
        const quantityInMl = values.unit === 'liter' ? values.quantity * 1000 : values.quantity;
        
        onSuccess({
          quantitySoldMl: quantityInMl,
          salePrice: values.salePrice,
        });
    } catch(error) {
        console.error("Error in sale submission:", error);
    } finally {
        setIsSubmitting(false);
        onClose();
    }
  }

  if (!drum) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Jual Eceran dari: {drum.name}</DialogTitle>
          <DialogDescription>
            Sisa volume saat ini: {drum.currentVolumeMl?.toLocaleString() || 0} ml.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Jumlah Jual</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Contoh: 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Satuan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Harga Jual (Rp)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Contoh: 12.500"
                      value={displaySalePrice}
                      onChange={(e) => {
                        const numericValue = parseRupiah(e.target.value);
                        setDisplaySalePrice(formatRupiah(e.target.value));
                        field.onChange(numericValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan & Tambah ke Kasir'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
