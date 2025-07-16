// src/app/stock-history/page.tsx

'use client';
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/transactions/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
import { StockMovementType } from '@prisma/client';
import { Download } from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type StockMovementWithProduct = {
  id: string;
  product: { name: string; unit: string; };
  type: StockMovementType;
  quantity: number;
  notes: string | null;
  createdAt: string;
};

// Komponen helper didefinisikan di satu tempat
function MovementTypeBadge({ type }: { type: StockMovementType }) {
  switch (type) {
    case 'IN':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Masuk</Badge>;
    case 'OUT':
      return <Badge variant="destructive">Keluar</Badge>;
    case 'ADJUSTMENT':
      return <Badge variant="secondary">Penyesuaian</Badge>;
    default:
      return <Badge>{type}</Badge>;
  }
}

function HistorySkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="border rounded-md">
                <Skeleton className="h-12 w-full" />
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full border-t" />
                ))}
            </div>
        </div>
    )
}

export default function StockHistoryPage() {
  const [movements, setMovements] = useState<StockMovementWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  useEffect(() => {
    async function fetchHistory() {
      if (!dateRange?.from) return;
      setLoading(true);

      const fromISO = dateRange.from.toISOString();
      const toISO = (dateRange.to || dateRange.from).toISOString();

      try {
        const response = await fetch(`/api/stock-history?from=${fromISO}&to=${toISO}`);
        if (!response.ok) throw new Error('Gagal memuat data');
        const data = await response.json();
        setMovements(data);
      } catch (error) {
        console.error("Gagal mengambil riwayat stok:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [dateRange]);

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.text("Laporan Riwayat Stok", 14, 15);
    autoTable(doc, {
      head: [['Tanggal', 'Produk', 'Tipe', 'Jumlah', 'Catatan']],
      body: movements.map(item => [
        new Date(item.createdAt).toLocaleString('id-ID'),
        item.product.name,
        item.type,
        item.type === 'IN' ? `+${item.quantity}` : `-${item.quantity}`,
        item.notes || '-'
      ]),
    });
    doc.save(`riwayat-stok-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleDownloadExcel = () => {
    const formattedData = movements.map(item => ({
      'Tanggal': new Date(item.createdAt).toLocaleString('id-ID'),
      'Produk': item.product.name,
      'Tipe': item.type,
      'Jumlah': item.type === 'IN' ? `+${item.quantity}` : `-${item.quantity}`,
      'Catatan': item.notes || '-'
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Stok");
    XLSX.writeFile(workbook, `riwayat-stok-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (loading) {
    return <HistorySkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle>Histori Pergerakan Stok</CardTitle>
                <CardDescription>
                Mencatat semua penambahan, pengurangan, dan penyesuaian stok produk.
                </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                <div className="flex gap-2">
                    <Button onClick={handleDownloadExcel} variant="outline" size="sm" className="gap-1">
                        <Download className="h-4 w-4" /> Excel
                    </Button>
                    <Button onClick={handleDownloadPdf} variant="outline" size="sm" className="gap-1">
                        <Download className="h-4 w-4" /> PDF
                    </Button>
                </div>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-center">Jumlah</TableHead>
              <TableHead>Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length > 0 ? (
              movements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </TableCell>
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell>
                    <MovementTypeBadge type={item.type} />
                  </TableCell>
                  <TableCell className={`text-center font-bold ${item.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                    {item.type === 'IN' ? `+${item.quantity}` : `-${item.quantity}`}
                  </TableCell>
                  <TableCell>{item.notes || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Tidak ada riwayat pergerakan stok pada rentang tanggal ini.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}