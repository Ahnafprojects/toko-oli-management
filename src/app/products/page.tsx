// src/app/products/page.tsx
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import ProductList from '@/components/products/ProductList';
import ProductStats from '@/components/products/ProductStats';

// Tipe baru untuk produk yang sudah di-serialisasi
export type SafeProduct = Omit<Awaited<ReturnType<typeof getProducts>>[0], 'buyPrice' | 'sellPrice'> & {
  buyPrice: number;
  sellPrice: number;
};

async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // PERBAIKAN: Ubah tipe Decimal menjadi number agar aman dikirim
  return products.map(product => ({
    ...product,
    buyPrice: product.buyPrice.toNumber(),
    sellPrice: product.sellPrice.toNumber(),
  }));
}

export default async function ProductsPage() {
  const allProducts = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Produk & Stok</h1>
        <Button asChild>
          <Link href="/products/add">
            <PlusCircle className="w-4 h-4 mr-2" />
            Tambah Produk
          </Link>
        </Button>
      </div>

      {/* Komponen statistik sekarang menerima data yang aman */}
      <ProductStats products={allProducts} />

      {/* Komponen daftar produk akan mengambil datanya sendiri */}
      <ProductList />
    </div>
  );
}
