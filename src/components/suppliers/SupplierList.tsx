'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Supplier } from '@prisma/client';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

// Mendefinisikan tipe props yang diterima oleh komponen ini
interface SupplierListProps {
  suppliers: Supplier[];
}

export default function SupplierList({ suppliers }: SupplierListProps) {
  const router = useRouter();
  // State untuk mengontrol dialog konfirmasi hapus
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Fungsi yang akan dipanggil saat tombol "Ya, Hapus" di dialog diklik
  const handleDelete = async () => {
    if (!supplierToDelete) return;

    try {
      const response = await fetch(`/api/suppliers/${supplierToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Gagal menghapus supplier.');
      }

      alert('Supplier berhasil dihapus!');
      setSupplierToDelete(null); // Tutup dialog
      router.refresh(); // Memuat ulang data dari server agar daftar terupdate
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
      setSupplierToDelete(null); // Tutup dialog jika terjadi error
    }
  };

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Supplier</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Belum ada data supplier.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contact}</TableCell>
                  <TableCell>{supplier.email || '-'}</TableCell>
                  <TableCell>{supplier.address || '-'}</TableCell>
                  <TableCell className="text-right">
                    {/* Menu Aksi Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Buka menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white z-50">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => router.push(`/suppliers/edit/${supplier.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onSelect={(e) => {
                            e.preventDefault();
                            setSupplierToDelete(supplier); // Buka dialog konfirmasi
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Hapus</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={!!supplierToDelete} onOpenChange={() => setSupplierToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus supplier
              <strong> {supplierToDelete?.name} </strong> secara permanen.
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
    </>
  );
}