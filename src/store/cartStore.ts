// src/store/cartStore.ts
import { create } from 'zustand';
import { Product } from '@prisma/client';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  total: number;
  // PERUBAHAN: addToCart sekarang menerima parameter quantity
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateTotal = (cart: CartItem[]) =>
  cart.reduce((acc, item) => acc + Number(item.sellPrice) * item.quantity, 0);

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  total: 0,
  addToCart: (product, quantity) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);
      let updatedCart;
      if (existingItem) {
        // Jika item sudah ada, tambahkan jumlahnya
        updatedCart = state.cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Jika item baru, tambahkan ke keranjang dengan jumlah yang ditentukan
        updatedCart = [...state.cart, { ...product, quantity }];
      }
      return { cart: updatedCart, total: calculateTotal(updatedCart) };
    }),
  removeFromCart: (productId) =>
    set((state) => {
      const updatedCart = state.cart.filter((item) => item.id !== productId);
      return { cart: updatedCart, total: calculateTotal(updatedCart) };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity < 1) {
        // Hapus item jika kuantitas kurang dari 1
        const updatedCart = state.cart.filter((item) => item.id !== productId);
        return { cart: updatedCart, total: calculateTotal(updatedCart) };
      }
      const updatedCart = state.cart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      return { cart: updatedCart, total: calculateTotal(updatedCart) };
    }),
  clearCart: () => set({ cart: [], total: 0 }),
}));
