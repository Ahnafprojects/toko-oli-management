'use client';

import React from 'react';

// Tipe data yang dibutuhkan oleh komponen struk ini
type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};
interface ReceiptProps {
  items: CartItem[];
  total: number;
  invoiceNumber: string;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  cashierName?: string;
}

const formatCurrency = (amount: number) => `Rp ${Math.round(amount).toLocaleString('id-ID')}`;

// Komponen ini menggunakan React.forwardRef agar bisa "dibaca" oleh library react-to-print
export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>((props, ref) => {
  const { items, total, invoiceNumber, paidAmount, changeAmount, paymentMethod, cashierName } = props;

  return (
    <div ref={ref} className="p-4 bg-white text-black font-mono text-xs w-[300px]">
      <div className="text-center">
        <h1 className="font-bold text-base">UD DOUBLE M</h1>
        <p>Jl. Raya Oli Sejahtera No. 123</p>
        <p>Terima Kasih</p>
      </div>
      <div className="border-t border-dashed border-black my-2 pt-2 text-xs">
        <p>No: {invoiceNumber}</p>
        <p>Kasir: {cashierName || 'Admin'}</p>
        <p>Tanggal: {new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</p>
      </div>
      <div className="border-t border-dashed border-black my-2"></div>
      {items.map(item => (
        <div key={item.productId} className="mb-1">
          <p>{item.name}</p>
          <div className="flex justify-between">
            <span>{item.quantity} x {formatCurrency(item.price)}</span>
            <span>{formatCurrency(item.quantity * item.price)}</span>
          </div>
        </div>
      ))}
      <div className="border-t border-dashed border-black my-2"></div>
      <div className="space-y-1 mt-2">
        <div className="flex justify-between font-bold text-base">
          <span>TOTAL</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <div className="flex justify-between">
          <span>{paymentMethod.toUpperCase()}</span>
          <span>{formatCurrency(paidAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>KEMBALI</span>
          <span>{formatCurrency(changeAmount)}</span>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = "Receipt";