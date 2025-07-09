// src/components/pos/QuantityModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Product } from '@prisma/client';

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  product: Product | null;
}

export default function QuantityModal({ isOpen, onClose, onConfirm, product }: QuantityModalProps) {
  const [quantity, setQuantity] = useState('1');

  // Reset kuantitas setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setQuantity('1');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const numQuantity = parseInt(quantity, 10);
    if (!isNaN(numQuantity) && numQuantity > 0) {
      onConfirm(numQuantity);
      onClose();
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Masukkan Jumlah</DialogTitle>
          <DialogDescription>
            Masukkan jumlah untuk produk <span className="font-semibold">{product.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label htmlFor="quantity" className="text-sm font-medium">
            Jumlah ({product.unit})
          </label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Contoh: 1000"
            className="mt-1 text-lg"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleConfirm}>Tambah ke Keranjang</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
