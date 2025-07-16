'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useCartStore, CartItem } from '@/store/cartStore';
import ProductSelector from './ProductSelector';
import CartItems from './CartItems';
import PaymentModal from './PaymentModal';
import QuantityModal from './QuantityModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { Search, Printer } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter
} from "@/components/ui/alert-dialog";
import { Product, Category } from '@prisma/client';
import { useSession } from 'next-auth/react';
import toast, { Toaster } from 'react-hot-toast';
import { Receipt } from './Receipt';

interface ProductWithCategory extends Product {
  category: Category;
}

interface PrintableTransaction {
  items: CartItem[];
  total: number;
  invoiceNumber: string;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  cashierName?: string;
}

export default function POSInterface() {
  const { cart, total, addToCart, clearCart } = useCartStore();
  const [showPayment, setShowPayment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { products, loading, error } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | null>(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const { data: session } = useSession();
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Jumlah produk per halaman
  
  // State untuk transaction yang bisa di-print
  const [printableTransaction, setPrintableTransaction] = useState<PrintableTransaction | null>(null);

  // =================================================================
  // FITUR PRINTING YANG DIOPTIMASI DENGAN window.print()
  // =================================================================
  
  const receiptToPrintRef = useRef<HTMLDivElement>(null);
  const [isReceiptReady, setIsReceiptReady] = useState(false);

  useEffect(() => {
    if (!printableTransaction) {
      setIsReceiptReady(false);
      return;
    }
    
    const timer = setTimeout(() => {
      if (receiptToPrintRef.current) {
        setIsReceiptReady(true);
      } else {
        toast.error('Gagal menyiapkan struk untuk dicetak.');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [printableTransaction]);

  const handlePrint = useCallback(() => {
    if (!isReceiptReady) return;
    window.print();
  }, [isReceiptReady]);

  // =================================================================
  // FITUR PAGINATION DAN PENCARIAN
  // =================================================================

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleProductSelect = useCallback((product: ProductWithCategory) => {
    const itemInCart = cart.find(item => item.productId === product.id && !item.isDrumSale);
    const qtyInCart = itemInCart?.quantity || 0;

    if ((product.stock ?? 0) <= qtyInCart) {
      toast.error(`Stok ${product.name} tidak mencukupi.`);
      return;
    }

    if (product.category.name.toLowerCase() === 'eceran') {
      setSelectedProduct(product);
      setIsQuantityModalOpen(true);
    } else {
      // --- PERBAIKAN: Konversi harga dari Decimal ke number dan format yang benar ---
      const productToAdd = {
        ...product,
        buyPrice: Number(product.buyPrice),
        sellPrice: Number(product.sellPrice),
      };
      // Panggil addToCart dengan format yang benar
      addToCart(productToAdd, { quantity: 1 });
    }
  }, [cart, addToCart]);

  const handleQuantityConfirm = useCallback((quantity: number) => {
    if (selectedProduct) {
      // --- PERBAIKAN: Konversi harga dari Decimal ke number dan format yang benar ---
      const productToAdd = {
        ...selectedProduct,
        buyPrice: Number(selectedProduct.buyPrice),
        sellPrice: Number(selectedProduct.sellPrice),
      };
      // Panggil addToCart dengan format yang benar
      addToCart(productToAdd, { quantity: quantity });
    }
    setIsQuantityModalOpen(false);
    setSelectedProduct(null);
  }, [selectedProduct, addToCart]);

  const handleCheckout = useCallback(() => {
    if (cart.length > 0) {
      setShowPayment(true);
    }
  }, [cart.length]);

  const handlePaymentSuccess = useCallback((transaction: any) => {
    setShowPayment(false);
    setPrintableTransaction({
      items: cart,
      total: transaction.totalAmount,
      invoiceNumber: transaction.invoiceNumber,
      paidAmount: transaction.paidAmount,
      changeAmount: transaction.changeAmount,
      paymentMethod: transaction.paymentMethod,
      cashierName: session?.user?.name || 'Kasir',
    });
    toast.success('Transaksi berhasil disimpan!');
    clearCart();
  }, [cart, clearCart, session]);

  const handleNewTransaction = useCallback(() => {
    setPrintableTransaction(null);
  }, []);

  const handleDialogChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      handleNewTransaction();
    }
  }, [handleNewTransaction]);

  if (error) {
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  }

  return (
    <>
      {/* ================================================================= */}
      {/* CSS KHUSUS UNTUK MENCETAK                                       */}
      {/* ================================================================= */}
      <style jsx global>{`
        .print-only {
          display: none;
        }

        @media print {
          .no-print {
            display: none !important;
          }

          .print-only {
            display: block !important;
            position: absolute;
            top: 0;
            left: 0;
          }
        }
      `}</style>

      {/* KONTEN STRUK YANG AKAN DICETAK */}
      <div className="print-only">
        {printableTransaction && <Receipt ref={receiptToPrintRef} {...printableTransaction} />}
      </div>

      {/* KONTEN UTAMA */}
      <div className="no-print">
        <Toaster position="top-center" />
        <div id="receipt-print-section" style={{ display: 'none' }}>
          {printableTransaction && (
            <Receipt ref={receiptToPrintRef} {...printableTransaction} />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 h-full p-4">
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
                products={paginatedProducts}
                loading={loading}
                onProductSelect={handleProductSelect}
              />
            </div>
            <div className="p-4 border-t flex items-center justify-center gap-4">
              <Button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                variant="outline"
              >
                Sebelumnya
              </Button>
              <span className="font-medium text-sm">
                Halaman {currentPage} dari {totalPages > 0 ? totalPages : 1}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                variant="outline"
              >
                Berikutnya
              </Button>
            </div>
          </div>

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

        {showPayment && (
          <PaymentModal
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            onSuccess={handlePaymentSuccess}
          />
        )}

        <QuantityModal
          isOpen={isQuantityModalOpen}
          onClose={() => setIsQuantityModalOpen(false)}
          onConfirm={handleQuantityConfirm}
          product={selectedProduct}
        />

        <AlertDialog open={!!printableTransaction} onOpenChange={handleDialogChange}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Transaksi Berhasil!</AlertDialogTitle>
              <AlertDialogDescription>
                Transaksi telah berhasil disimpan. Anda bisa mencetak struk atau memulai transaksi baru.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <Button variant="outline" onClick={handleNewTransaction}>
                Transaksi Baru
              </Button>
              <Button onClick={handlePrint} className="gap-2" disabled={!isReceiptReady}>
                <Printer className="h-4 w-4" />
                {isReceiptReady ? 'Cetak Struk' : 'Menyiapkan...'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}