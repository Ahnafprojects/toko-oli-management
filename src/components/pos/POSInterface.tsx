// src/components/pos/POSInterface.tsx
'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import ProductSelector from './ProductSelector';
import CartItems from './CartItems';
import PaymentModal from './PaymentModal';
import QuantityModal from './QuantityModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { Product, Category } from '@prisma/client';

// Tipe ini diperlukan karena kita menyertakan data kategori
interface ProductWithCategory extends Product {
  category: Category;
}

export default function POSInterface() {
  const { cart, total, addToCart, clearCart } = useCartStore();
  const [showPayment, setShowPayment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { products, loading, error } = useProducts();

  // State untuk modal kuantitas
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // FUNGSI DENGAN LOGIKA BARU
  const handleProductSelect = (product: ProductWithCategory) => {
    // Cek berdasarkan nama kategori (tidak case-sensitive)
    if (product.category.name.toLowerCase() === 'eceran') {
      setSelectedProduct(product);
      setIsQuantityModalOpen(true);
    } else {
      // Untuk produk non-eceran, langsung tambahkan 1
      addToCart(product, 1);
    }
  };

  // Fungsi untuk konfirmasi dari modal kuantitas
  const handleQuantityConfirm = (quantity: number) => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity);
    }
  };

  const handleCheckout = () => {
    if (cart.length > 0) {
      setShowPayment(true);
    }
  };

  const handlePaymentSuccess = (transaction: any) => {
    setShowPayment(false);
    clearCart();
    alert(`Transaksi ${transaction.invoiceNumber} berhasil!`);
    window.location.reload(); 
  };

  if (error) {
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
        {/* Kolom Pilihan Produk */}
        <div className="lg:col-span-3 flex flex-col h-full bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ProductSelector
              products={filteredProducts}
              loading={loading}
              onProductSelect={handleProductSelect}
            />
          </div>
        </div>

        {/* Kolom Keranjang & Checkout */}
        <div className="lg:col-span-2 flex flex-col h-full bg-white rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle>Detail Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4 overflow-y-auto">
            <CartItems />
          </CardContent>
          <CardFooter className="p-4 flex-col gap-4 border-t">
            <div className="w-full flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(total)}</span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full"
              disabled={cart.length === 0 || loading}
              size="lg"
            >
              Lanjutkan ke Pembayaran
            </Button>
          </CardFooter>
        </div>
      </div>

      {/* Modal Pembayaran */}
      {showPayment && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal Kuantitas */}
      <QuantityModal
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        onConfirm={handleQuantityConfirm}
        product={selectedProduct}
      />
    </>
  );
}
