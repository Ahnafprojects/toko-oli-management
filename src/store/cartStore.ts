// src/store/cartStore.ts
import { create } from 'zustand';
import { Product } from '@prisma/client';

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  total: number;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// Menghitung total dengan memastikan harga valid
const calculateTotal = (cart: CartItem[]) =>
  cart.reduce((acc, item) => {
    const price = Number(item.sellPrice);
    if (isNaN(price)) {
      console.warn(`Harga produk tidak valid untuk ${item.name}:`, item.sellPrice);
      return acc;
    }
    return acc + price * item.quantity;
  }, 0);

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  total: 0,

  addToCart: (product, quantity) =>
    set((state) => {
      if (!quantity || quantity <= 0) {
        console.warn(`Quantity tidak valid saat addToCart untuk ${product.name}:`, quantity);
        return state;
      }

      const price = Number(product.sellPrice);
      if (isNaN(price) || price < 0) {
        console.warn(`Harga produk tidak valid saat addToCart untuk ${product.name}:`, product.sellPrice);
        return state;
      }

      const existingItem = state.cart.find((item) => item.id === product.id);
      let updatedCart: CartItem[];

      if (existingItem) {
        updatedCart = state.cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedCart = [...state.cart, { ...product, quantity }];
      }

      const total = calculateTotal(updatedCart);
      return { cart: updatedCart, total };
    }),

  removeFromCart: (productId) =>
    set((state) => {
      const updatedCart = state.cart.filter((item) => item.id !== productId);
      return { cart: updatedCart, total: calculateTotal(updatedCart) };
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity < 1) {
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
