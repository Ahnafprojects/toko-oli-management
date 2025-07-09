// src/components/pos/PaymentModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSession } from 'next-auth/react';
import { PaymentMethod } from '@prisma/client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: any) => void;
}

// Helper untuk format angka ke Rupiah dengan titik
const formatRupiah = (angka: number | string) => {
  const number_string = String(angka).replace(/[^,\d]/g, '');
  const sisa = number_string.length % 3;
  let rupiah = number_string.substr(0, sisa);
  const ribuan = number_string.substr(sisa).match(/\d{3}/gi);

  if (ribuan) {
    const separator = sisa ? '.' : '';
    rupiah += separator + ribuan.join('.');
  }
  return rupiah || '0';
};

// Helper untuk mengubah format Rupiah kembali ke angka
const parseRupiah = (rupiah: string) => {
  return Number(String(rupiah).replace(/[^0-9]/g, ''));
};

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { cart, total, clearCart } = useCartStore();
  const { data: session, status } = useSession(); // Tambahkan status untuk memeriksa sesi
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [displayPaidAmount, setDisplayPaidAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDisplayPaidAmount(formatRupiah(total));
    }
  }, [isOpen, total]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = parseRupiah(value);
    setDisplayPaidAmount(formatRupiah(numericValue));
  };
  
  const handlePayment = async () => {
    // PERBAIKAN: Tambahkan pengecekan status sesi
    if (status !== 'authenticated' || !session?.user?.id) {
      setError("Sesi pengguna tidak valid. Silakan coba login ulang.");
      return;
    }

    if (!paymentMethod) {
      setError('Metode pembayaran harus dipilih.');
      return;
    }
    
    const paidAmountNumber = parseRupiah(displayPaidAmount);

    if (paidAmountNumber < total) {
      setError('Jumlah bayar tidak mencukupi.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          totalAmount: total,
          paymentMethod,
          paidAmount: paidAmountNumber,
          userId: session.user.id, // Sekarang dijamin ada dan valid
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Gagal menyimpan transaksi');
      }

      const newTransaction = await response.json();
      onSuccess(newTransaction);
      clearCart();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const paidAmountNumber = parseRupiah(displayPaidAmount);
  const changeAmount = paidAmountNumber - total;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Proses Pembayaran</DialogTitle>
          <DialogDescription>
            Selesaikan transaksi dengan mengisi detail pembayaran.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Belanja</p>
            <p className="text-3xl font-bold">Rp{formatRupiah(total)}</p>
          </div>
          <Select onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Metode Pembayaran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PaymentMethod.Tunai}>Tunai</SelectItem>
              <SelectItem value={PaymentMethod.QRIS}>QRIS</SelectItem>
              <SelectItem value={PaymentMethod.TransferBank}>Transfer Bank</SelectItem>
            </SelectContent>
          </Select>
          {paymentMethod === 'Tunai' && (
            <div>
              <label htmlFor="paidAmount" className="text-sm font-medium">Jumlah Bayar (Rp)</label>
              <Input 
                id="paidAmount"
                type="text" 
                value={displayPaidAmount}
                onChange={handleInputChange}
                placeholder="Masukkan jumlah uang"
                className="text-right text-lg"
              />
              {changeAmount >= 0 && (
                <p className="text-sm mt-2 text-muted-foreground">Kembalian: <span className="font-semibold text-foreground">Rp{formatRupiah(changeAmount)}</span></p>
              )}
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Batal</Button>
          {/* Tombol dinonaktifkan jika sesi belum siap */}
          <Button onClick={handlePayment} disabled={isLoading || !paymentMethod || status !== 'authenticated'}>
            {isLoading ? 'Memproses...' : 'Konfirmasi & Cetak Struk'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
