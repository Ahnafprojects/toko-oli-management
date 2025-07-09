// src/components/products/ProductStats.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, PackageCheck, AlertTriangle, XCircle } from "lucide-react";
import { SafeProduct } from "@/app/products/page"; // Import tipe baru

interface ProductStatsProps {
  products: SafeProduct[];
}

export default function ProductStats({ products }: ProductStatsProps) {
  const totalProducts = products.length;
  // Hitung total nilai stok dari harga beli
  const totalStockValue = products.reduce((sum, p) => sum + (p.buyPrice * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    { title: "Total Produk", value: totalProducts, isCurrency: false },
    { title: "Total Nilai Stok", value: totalStockValue, isCurrency: true },
    { title: "Stok Menipis", value: lowStockCount, isCurrency: false },
    { title: "Stok Habis", value: outOfStockCount, isCurrency: false },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {index === 0 && <Package className="h-4 w-4 text-muted-foreground" />}
            {index === 1 && <PackageCheck className="h-4 w-4 text-muted-foreground" />}
            {index === 2 && <AlertTriangle className="h-4 w-4 text-muted-foreground" />}
            {index === 3 && <XCircle className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.title === 'Total Produk' ? 'Jenis Produk' : stat.title === 'Total Nilai Stok' ? 'Berdasarkan Harga Beli' : 'Jenis Produk'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
