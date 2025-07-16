'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import toast from 'react-hot-toast';

interface UpdateVolumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  drum: {
    id: string;
    name: string;
    currentVolumeMl: number | null;
  } | null;
}

const formSchema = z.object({
  newVolume: z.coerce.number().min(0, "Volume tidak boleh negatif"),
});

export default function UpdateVolumeModal({ isOpen, onClose, drum, onSuccess }: UpdateVolumeModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (drum) {
      form.setValue('newVolume', drum.currentVolumeMl || 0);
    }
  }, [drum, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!drum) return;

    const promise = fetch('/api/drums/update-volume', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: drum.id,
        newVolume: values.newVolume,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal memperbarui volume.');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Menyimpan perubahan...',
      success: () => {
        onSuccess(); // Ini akan memanggil router.refresh() dari parent
        onClose();
        return 'Volume berhasil diperbarui!';
      },
      error: (err) => err.message,
    });
  };

  if (!drum) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Update Volume: {drum.name}</DialogTitle>
          <DialogDescription>
            Masukkan sisa volume baru untuk drum ini dalam mililiter (ml).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="newVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Volume Baru (ml)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}