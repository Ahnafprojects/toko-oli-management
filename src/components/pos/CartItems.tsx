// src/components/pos/CartItems.tsx
'use client';

import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MinusCircle, PlusCircle, ShoppingCart, Trash2 } from 'lucide-react';

export default function CartItems() {
  const { cart, updateQuantity, removeFromCart } = useCartStore();

  const handleQuantityChange = (cartItemId: string, newQuantity: string) => {
    const quantity = parseInt(newQuantity, 10);
    // Hanya update jika input adalah angka yang valid dan lebih dari 0
    if (!isNaN(quantity) && quantity > 0) {
      updateQuantity(cartItemId, quantity);
    } else if (newQuantity === '') {
      // Jika input dikosongkan, jangan lakukan apa-apa sementara
      // Biarkan onBlur yang menanganinya
    }
  };

  const handleBlur = (cartItemId: string, currentQuantity: number) => {
    // Jika input ditinggalkan kosong, kembalikan ke 1
    if (currentQuantity === 0 || isNaN(currentQuantity)) {
      updateQuantity(cartItemId, 1);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center text-gray-500 h-full flex flex-col items-center justify-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
        <p className="font-medium">Keranjang masih kosong</p>
        <p className="text-sm">Silakan pilih produk untuk ditambahkan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cart.map((item) => (
        <div key={item.cartItemId} className="flex items-center gap-4 text-sm">
          <div className="flex-1 min-w-0">
            <p className="font-semibold leading-tight" title={item.name}>{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR', 
                minimumFractionDigits: 0 
              }).format(Number(item.price))}
            </p>
          </div>

          <div className="flex-shrink-0 font-semibold w-24 text-right">
            {new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: 'IDR', 
              minimumFractionDigits: 0 
            }).format(Number(item.price) * item.quantity)}
          </div>

          {/* Kontrol Kuantitas dengan Input */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7"
              onClick={() => updateQuantity(item.cartItemId, -1)}
              disabled={item.quantity === 1}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <Input
              type="text"
              className="h-7 w-12 text-center font-bold"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item.cartItemId, e.target.value)}
              onBlur={() => handleBlur(item.cartItemId, item.quantity)}
            />
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7"
              onClick={() => updateQuantity(item.cartItemId, 1)}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-red-500 flex-shrink-0"
            onClick={() => removeFromCart(item.cartItemId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}