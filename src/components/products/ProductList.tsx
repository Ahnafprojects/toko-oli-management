'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoreHorizontal, Edit, Trash2, Replace } from "lucide-react";
import { Product, Category, Prisma } from '@prisma/client';
import StockAdjustmentModal from './StockAdjustmentModal';

type ProductWithCategory = Product & {
  category: Category;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount);
};

export default function ProductList() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productToDelete, setProductToDelete] = useState<ProductWithCategory | null>(null);
  const [productToAdjust, setProductToAdjust] = useState<ProductWithCategory | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Gagal memuat data produk');
      }
      const data = await response.json();
      
      const formattedData: ProductWithCategory[] = data.map((product: any) => ({
        ...product,
        buyPrice: parseFloat(product.buyPrice),
        sellPrice: parseFloat(product.sellPrice),
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
        expiredDate: product.expiredDate ? new Date(product.expiredDate) : null,
      }));

      setProducts(formattedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Gagal menghapus produk.');
      }
      alert('Produk berhasil dihapus!');
      setProductToDelete(null);
      fetchProducts();
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
      setProductToDelete(null);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'low') return p.stock > 0 && p.stock <= p.minStock;
        if (statusFilter === 'out') return p.stock === 0;
        return true;
      });
  }, [products, searchTerm, statusFilter]);

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return <Badge variant="destructive">Habis</Badge>;
    if (stock <= minStock) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Rendah</Badge>;
    return <Badge variant="default" className="bg-green-100 text-green-800">Aman</Badge>;
  };

  return (
    <>
      <Card className="bg-white rounded-lg shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <Input
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex items-center gap-2">
              <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>Semua</Button>
              <Button variant={statusFilter === 'low' ? 'default' : 'outline'} onClick={() => setStatusFilter('low')}>Stok Rendah</Button>
              <Button variant={statusFilter === 'out' ? 'default' : 'outline'} onClick={() => setStatusFilter('out')}>Stok Habis</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga Beli</TableHead>
                <TableHead>Harga Jual</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center">Memuat data...</TableCell></TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center">Tidak ada produk yang ditemukan.</TableCell></TableRow>
              ) : filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name} ({product.unit})</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{formatCurrency(product.buyPrice as any)}</TableCell>
                  <TableCell>{formatCurrency(product.sellPrice as any)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{getStockStatus(product.stock, product.minStock)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white z-50">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        {/* PERBAIKAN DI BAWAH INI */}
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); router.push(`/products/edit/${product.id}`) }}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit Detail</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setProductToAdjust(product) }}>
                          <Replace className="mr-2 h-4 w-4" />
                          <span>Sesuaikan Stok</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 focus:bg-red-50" 
                          onSelect={(e) => { e.preventDefault(); setProductToDelete(product) }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Hapus</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk
              <strong> {productToDelete?.name} </strong> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StockAdjustmentModal
        isOpen={!!productToAdjust}
        onClose={() => setProductToAdjust(null)}
        product={productToAdjust}
        onSuccess={fetchProducts}
      />
    </>
  );
}