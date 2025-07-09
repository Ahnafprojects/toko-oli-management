// src/components/suppliers/SupplierList.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Supplier } from '@prisma/client';

interface SupplierListProps {
  suppliers: Supplier[];
}

export default function SupplierList({ suppliers }: SupplierListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Supplier</TableHead>
            <TableHead>Kontak</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Alamat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.contact}</TableCell>
              <TableCell>{supplier.email}</TableCell>
              <TableCell>{supplier.address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
