// src/components/transactions/TransactionList.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { DatePickerWithRange } from './DateRangePicker';
import { ChevronRight, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipe data yang aman (harus cocok dengan yang dikirim dari API)
type SafeTransactionItem = {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; unit: string; };
};
type SafeDrumSale = {
  id: string;
  quantitySoldMl: number;
  salePrice: number;
  product: { name: string; };
}
type SafeTransaction = {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  user: { name: string | null };
  paymentMethod: string;
  totalAmount: number;
  items: SafeTransactionItem[];
  drumSales: SafeDrumSale[];
};

// PERBAIKAN: Komponen ExportButtons dengan logika yang benar
function ExportButtons({ data }: { data: SafeTransaction[] }) {
  const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`;

  const exportToExcel = () => {
    const flatData = data.flatMap(t => {
      const commonData = {
        "No. Invoice": t.invoiceNumber,
        "Tanggal": new Date(t.createdAt).toLocaleString('id-ID'),
        "Kasir": t.user.name || 'N/A',
        "Metode Bayar": t.paymentMethod,
        "Total Transaksi": t.totalAmount,
      };
      
      const items = t.items.map(item => ({
        ...commonData,
        "Nama Barang": item.product.name,
        "Jumlah": `${item.quantity} ${item.product.unit}`,
        "Harga Satuan": item.price,
        "Subtotal": item.price * item.quantity,
      }));

      const drumSales = t.drumSales.map(sale => ({
        ...commonData,
        "Nama Barang": `${sale.product.name} (Eceran)`,
        "Jumlah": `${sale.quantitySoldMl} ml`,
        "Harga Satuan": 'N/A',
        "Subtotal": sale.salePrice,
      }));
      
      return [...items, ...drumSales];
    });

    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transaksi");
    XLSX.writeFile(workbook, "histori_transaksi_detail.xlsx");
  };

  const exportToPdf = () => {
    const doc = new jsPDF();
    const tableData: any[] = [];

    data.forEach(t => {
      // Baris utama untuk setiap transaksi
      tableData.push([
        { content: t.invoiceNumber, styles: { fontStyle: 'bold' } },
        new Date(t.createdAt).toLocaleDateString('id-ID'),
        t.user.name || 'N/A',
        { content: formatCurrency(t.totalAmount), styles: { halign: 'right', fontStyle: 'bold' } }
      ]);

      // Baris detail untuk setiap item
      const allItems = [
        ...t.items.map(item => ({ name: item.product.name, qty: `${item.quantity} ${item.product.unit}`, price: item.price * item.quantity })),
        ...t.drumSales.map(sale => ({ name: `${sale.product.name} (Eceran)`, qty: `${sale.quantitySoldMl} ml`, price: sale.salePrice }))
      ];

      allItems.forEach(item => {
        tableData.push([
          { content: `  - ${item.name}`, styles: { cellWidth: 'wrap' } },
          item.qty,
          '', // Kolom kasir dikosongkan untuk item
          { content: formatCurrency(item.price), styles: { halign: 'right' } }
        ]);
      });
       // Baris pemisah
       tableData.push([{ content: '', colSpan: 4, styles: { fillColor: [230, 230, 230] } }]);
    });

    autoTable(doc, {
      head: [['No. Invoice', 'Tanggal', 'Kasir', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    doc.save('histori_transaksi_detail.pdf');
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportToExcel} variant="outline"><FileDown className="mr-2 h-4 w-4" />Excel</Button>
      <Button onClick={exportToPdf} variant="outline"><FileDown className="mr-2 h-4 w-4" />PDF</Button>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: SafeTransaction }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TableRow onClick={() => setIsOpen(!isOpen)} className="cursor-pointer hover:bg-muted/50">
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
            {transaction.invoiceNumber}
          </div>
        </TableCell>
        <TableCell>{new Date(transaction.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</TableCell>
        <TableCell>{transaction.user.name || 'N/A'}</TableCell>
        <TableCell><Badge>{transaction.paymentMethod}</Badge></TableCell>
        <TableCell className="text-right font-semibold">
          {`Rp ${transaction.totalAmount.toLocaleString('id-ID')}`}
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow className="bg-muted/50 hover:bg-muted/50">
          <TableCell colSpan={5} className="p-0">
            <div className="p-4">
              <h4 className="font-semibold mb-2 text-sm">Detail Item:</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead className="text-right">Total Harga</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transaction.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.quantity} {item.product.unit}</TableCell>
                      <TableCell className="text-right">{`Rp ${item.price.toLocaleString('id-ID')}`}</TableCell>
                    </TableRow>
                  ))}
                  {transaction.drumSales.map(sale => (
                     <TableRow key={sale.id}>
                      <TableCell>{sale.product.name} (Eceran)</TableCell>
                      <TableCell>{sale.quantitySoldMl} ml</TableCell>
                      <TableCell className="text-right">{`Rp ${sale.salePrice.toLocaleString('id-ID')}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}


export default function TransactionList() {
  const [transactions, setTransactions] = useState<SafeTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data);
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!dateRange?.from) return transactions;
    return transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      const fromDate = new Date(dateRange.from!);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from!);
      toDate.setHours(23, 59, 59, 999);
      return transactionDate >= fromDate && transactionDate <= toDate;
    });
  }, [transactions, dateRange]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Daftar Transaksi</CardTitle>
          <div className="flex items-center gap-4">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <ExportButtons data={filteredTransactions} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Invoice</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kasir</TableHead>
              <TableHead>Metode Pembayaran</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Memuat data...</TableCell></TableRow>
            ) : filteredTransactions.map((t) => (
              <TransactionRow key={t.id} transaction={t} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
