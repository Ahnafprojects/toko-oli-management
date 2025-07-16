// src/components/Receipt.tsx
'use client';
import { CartItem } from '@/store/cartStore';
import React from 'react';

interface ReceiptProps {
  items: CartItem[];
  total?: number;
  invoiceNumber: string;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  cashierName?: string;
}

const formatCurrency = (amount: number | null | undefined): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const getPrice = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value);
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return (value as any).toNumber();
  }
  return 0;
};

const calculateTotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + getPrice(item.sellPrice) * item.quantity, 0);
};

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>((props, ref) => {
  const { items, invoiceNumber, paidAmount, changeAmount, paymentMethod, cashierName } = props;
  const total = calculateTotal(items);
  const paid = getPrice(paidAmount);
  const change = getPrice(changeAmount);

  return (
    <div ref={ref} id="receipt" className="p-4 bg-white text-black font-mono text-xs w-[300px]">
      <div className="text-center">
        <h1 className="font-bold text-base">UD DOUBLE M</h1>
        <p>Jl. Raya Oli Sejahtera No. 123</p>
        <p>Terima Kasih</p>
      </div>
      <div className="border-t border-dashed border-black my-2 pt-2 text-xs">
        <p>No: {invoiceNumber}</p>
        <p>Kasir: {cashierName || 'Admin'}</p>
        <p>
          Tanggal:{' '}
          {new Date().toLocaleString('id-ID', {
            dateStyle: 'short',
            timeStyle: 'short'
          })}
        </p>
      </div>
      <div className="border-t border-dashed border-black my-2" />
      {items.map((item) => {
        const price = getPrice(item.sellPrice);
        return (
          <div key={item.id} className="mb-1">
            <p>{item.name}</p>
            <div className="flex justify-between">
              <span>{item.quantity} x {formatCurrency(price)}</span>
              <span>{formatCurrency(price * item.quantity)}</span>
            </div>
          </div>
        );
      })}
      <div className="border-t border-dashed border-black my-2" />
      <div className="space-y-1 mt-2">
        <div className="flex justify-between font-bold text-base">
          <span>TOTAL</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>{paymentMethod.toUpperCase()}</span>
          <span>{formatCurrency(paid)}</span>
        </div>
        <div className="flex justify-between">
          <span>KEMBALI</span>
          <span>{formatCurrency(change)}</span>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
