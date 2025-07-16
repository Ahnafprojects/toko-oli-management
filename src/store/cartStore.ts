import { create } from 'zustand';
import toast from 'react-hot-toast';
import { Product } from '@prisma/client';

// Tipe untuk produk yang bisa ditambahkan (harga SUDAH berupa number)
type ProductToAdd = Omit<Product, 'buyPrice' | 'sellPrice' | 'createdAt' | 'updatedAt' | 'expiredDate'> & {
  buyPrice: number;
  sellPrice: number;
};

// Tipe untuk item di dalam keranjang
export type CartItem = {
  cartItemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  isDrumSale: boolean;
  quantitySoldMl?: number;
};

interface CartState {
  cart: CartItem[];
  total: number;
  addToCart: (product: ProductToAdd, details: { quantity: number; isDrumSale?: boolean; quantitySoldMl?: number; price?: number }) => boolean;
  updateQuantity: (cartItemId: string, amount: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
}

const calculateTotal = (cart: CartItem[]) => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  total: 0,
  
  addToCart: (product, details) => {
    const { quantity, isDrumSale, quantitySoldMl, price } = details;
    const stock = isDrumSale ? product.currentVolumeMl ?? 0 : product.stock;
    const requestedAmount = isDrumSale ? quantitySoldMl! : quantity;

    if (stock < requestedAmount) {
      toast.error(`Stok/Volume untuk ${product.name} tidak mencukupi. Sisa: ${stock}`);
      return false;
    }

    const cart = get().cart;
    let updatedCart;
    
    if (!isDrumSale) {
      const existingItem = cart.find(item => item.productId === product.id && !item.isDrumSale);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (stock < newQuantity) {
          toast.error(`Stok ${product.name} tidak mencukupi.`);
          return false;
        }
        updatedCart = cart.map(item => item.productId === product.id ? { ...item, quantity: newQuantity } : item);
        toast.success(`${product.name} ditambahkan.`);
        set({ cart: updatedCart, total: calculateTotal(updatedCart) });
        return true;
      }
    }

    const newCartItem: CartItem = {
      cartItemId: `${isDrumSale ? 'drum' : 'item'}-${product.id}-${Date.now()}`,
      productId: product.id,
      name: isDrumSale ? `${product.name} (Eceran ${quantitySoldMl}ml)` : product.name,
      price: price || product.sellPrice,
      quantity,
      stock,
      isDrumSale: !!isDrumSale,
      quantitySoldMl,
    };
    updatedCart = [...cart, newCartItem];
    set({ cart: updatedCart, total: calculateTotal(updatedCart) });
    toast.success(`${newCartItem.name} ditambahkan ke keranjang.`);
    return true;
  },

  updateQuantity: (cartItemId, amount) => {
    set(state => {
      const itemToUpdate = state.cart.find(item => item.cartItemId === cartItemId);
      if (!itemToUpdate) return state;
      const newQuantity = itemToUpdate.quantity + amount;
      if (!itemToUpdate.isDrumSale && amount > 0 && newQuantity > itemToUpdate.stock) {
        toast.error(`Stok ${itemToUpdate.name} tidak mencukupi.`);
        return state;
      }
      const updatedCart = state.cart.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, newQuantity) } : item
      ).filter(item => item.quantity > 0);
      return { cart: updatedCart, total: calculateTotal(updatedCart) };
    });
  },
  
  removeFromCart: (cartItemId: string) => {
    set((state) => {
      const updatedCart = state.cart.filter((item) => item.cartItemId !== cartItemId);
      return { cart: updatedCart, total: calculateTotal(updatedCart) };
    });
  },
    
  clearCart: () => set({ cart: [], total: 0 }),
}));