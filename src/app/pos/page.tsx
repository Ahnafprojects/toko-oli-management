// src/app/pos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Search } from 'lucide-react';

// Tipe data untuk produk dan item di keranjang
type Product = {
  id: string;
  name: string;
  sellPrice: number;
  stock: number;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

// Komponen untuk menampilkan loading skeleton saat daftar produk dimuat
function ProductListSkeleton() {
  return (
    <div className="space-y-2 mt-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mengambil data produk di sisi klien setelah halaman dimuat
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Gagal memuat produk');
        const data = await response.json();
        const formattedData = data.map((p: any) => ({
            ...p,
            sellPrice: parseFloat(p.sellPrice) // Pastikan harga adalah angka
        }));
        setProducts(formattedData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);
  
  // Logika untuk menambah produk ke keranjang
  const handleAddToCart = (product: Product) => {
      // Implementasikan logika keranjang Anda di sini
      console.log(`Menambahkan ${product.name} ke keranjang`);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-screen p-6 bg-gray-50">
      
      {/* Kolom Kiri: Daftar Produk */}
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Pilih Produk</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari nama produk..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {loading ? (
              <ProductListSkeleton />
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    onClick={() => handleAddToCart(product)}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer border"
                  >
                    <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Stok: {product.stock}</p>
                    </div>
                    <p className="font-semibold">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.sellPrice)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Kolom Kanan: Keranjang Belanja */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Keranjang</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {/* Tampilkan item keranjang di sini */}
            <p className="text-center text-muted-foreground mt-10">Keranjang masih kosong.</p>
          </CardContent>
          <div className="p-6 border-t">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total</span>
              <span>Rp 0</span>
            </div>
            <Button className="w-full" size="lg">Bayar</Button>
          </div>
        </Card>
      </div>

    </div>
  );
}