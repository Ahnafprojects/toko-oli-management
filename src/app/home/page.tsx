// src/app/home/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  History,
  Users,
  Archive,
} from 'lucide-react';

// Daftar pintasan yang akan ditampilkan
const shortcuts = [
  { href: '/pos', label: 'Kasir (POS)', icon: ShoppingCart, description: 'Mulai transaksi penjualan baru.' },
  { href: '/products', label: 'Manajemen Produk', icon: Package, description: 'Lihat, tambah, atau edit produk.' },
  { href: '/dashboard', label: 'Lihat Dashboard', icon: LayoutDashboard, description: 'Analisis performa penjualan.' },
  { href: '/transactions', label: 'Riwayat Transaksi', icon: History, description: 'Lihat semua transaksi.' },
  { href: '/stock-history', label: 'Riwayat Stok', icon: Archive, description: 'Lacak pergerakan stok.' },
  { href: '/suppliers', label: 'Manajemen Supplier', icon: Users, description: 'Kelola data pemasok.' },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Menu Utama</h1>
        <p className="text-muted-foreground">Pilih tindakan yang ingin Anda lakukan.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shortcuts.map((item) => (
          <Link href={item.href} key={item.href}>
            <Card className="h-full hover:shadow-lg hover:border-blue-500 transition-all cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <item.icon className="w-8 h-8 text-blue-600" />
                <CardTitle>{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}