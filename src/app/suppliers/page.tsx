// src/app/suppliers/page.tsx
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic'; // di atas file `route.ts`


import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import SupplierList from '@/components/suppliers/SupplierList';

async function getSuppliers() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: {
      name: 'asc',
    },
  });
  return suppliers;
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Supplier</h1>
        <Button asChild>
          {/* Kita akan membuat halaman 'add' ini nanti */}
          <Link href="/suppliers/add">
            <PlusCircle className="w-4 h-4 mr-2" />
            Tambah Supplier
          </Link>
        </Button>
      </div>
      <SupplierList suppliers={suppliers} />
    </div>
  );
}
