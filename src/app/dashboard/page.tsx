'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, ShoppingCart, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { DatePickerWithRange } from "@/components/transactions/DateRangePicker";
import { DateRange } from "react-day-picker";
import { subDays, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";
import AiAssistant from "@/components/dashboard/AiAssistant";

// Tipe data yang diharapkan dari API
interface DashboardData {
  todayStats: {
    totalSales: number;
    totalProfit: number;
    transactionCount: number;
  };
  inventoryStats: {
    lowStockCount: number;
  };
  customRangeStats: {
    totalSales: number;
    totalProfit: number;
    transactionCount: number;
  };
  topSellingProducts: {
    name: string;
    totalSold: number;
  }[];
  monthStats: {
    totalSales: number;
    totalProfit: number;
    transactionCount: number;
  };
  yearStats: {
    totalSales: number;
    totalProfit: number;
    transactionCount: number;
  };
}

const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// Komponen Skeleton hanya didefinisikan satu kali
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><Skeleton className="h-[500px]" /></div>
        <div className="space-y-6"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/login');
    },
  });

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  useEffect(() => {
    async function fetchDashboardData() {
      if (!dateRange?.from) return;
      setLoading(true);
      
      const fromISO = dateRange.from.toISOString();
      const toISO = (dateRange.to || dateRange.from).toISOString();

      try {
        const response = await fetch(`/api/dashboard?from=${fromISO}&to=${toISO}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          console.error("Gagal mengambil data dashboard");
          setData(null);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [dateRange]);

  if (status === 'loading' || loading || !data) {
    return <DashboardSkeleton />;
  }

  const currentMonthName = format(new Date(), 'MMMM yyyy', { locale: id });
  const currentYear = format(new Date(), 'yyyy');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Utama</h1>
      
      {/* Kartu Statistik Hari Ini */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Statistik Hari Ini</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader>
                <CardContent><div className="text-2xl font-bold">{formatCurrency(data.todayStats.totalSales)}</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Keuntungan Hari Ini</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader>
                <CardContent><div className="text-2xl font-bold">{formatCurrency(data.todayStats.totalProfit)}</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle><ShoppingCart className="h-4 w-4 text-muted-foreground" /></CardHeader>
                <CardContent><div className="text-2xl font-bold">{data.todayStats.transactionCount}</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Produk Stok Rendah</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground" /></CardHeader>
                <CardContent><div className="text-2xl font-bold">{data.inventoryStats.lowStockCount}</div></CardContent>
            </Card>
        </div>
      </div>
      
      {/* KARTU STATISTIK BULANAN & TAHUNAN */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader><CardTitle>Statistik Bulan Ini ({currentMonthName})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center"><DollarSign className="h-5 w-5 mr-3 text-green-500"/><p>Total Penjualan: <span className="font-bold">{formatCurrency(data.monthStats.totalSales)}</span></p></div>
                <div className="flex items-center"><TrendingUp className="h-5 w-5 mr-3 text-green-500"/><p>Estimasi Keuntungan: <span className="font-bold">{formatCurrency(data.monthStats.totalProfit)}</span></p></div>
                <div className="flex items-center"><ShoppingCart className="h-5 w-5 mr-3 text-green-500"/><p>Jumlah Transaksi: <span className="font-bold">{data.monthStats.transactionCount}</span></p></div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Statistik Tahun Ini ({currentYear})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center"><DollarSign className="h-5 w-5 mr-3 text-blue-500"/><p>Total Penjualan: <span className="font-bold">{formatCurrency(data.yearStats.totalSales)}</span></p></div>
                <div className="flex items-center"><TrendingUp className="h-5 w-5 mr-3 text-blue-500"/><p>Estimasi Keuntungan: <span className="font-bold">{formatCurrency(data.yearStats.totalProfit)}</span></p></div>
                <div className="flex items-center"><ShoppingCart className="h-5 w-5 mr-3 text-blue-500"/><p>Jumlah Transaksi: <span className="font-bold">{data.yearStats.transactionCount}</span></p></div>
            </CardContent>
        </Card>
      </div>

      {/* Bagian Utama dengan AI Assistant dan Statistik Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AiAssistant />
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Analisis Rentang Waktu</CardTitle>
                    <CardDescription>Pilih rentang tanggal untuk melihat performa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <div><p className="text-sm text-muted-foreground">Total Penjualan</p><p className="text-xl font-bold">{formatCurrency(data.customRangeStats.totalSales)}</p></div>
                    <div><p className="text-sm text-muted-foreground">Estimasi Keuntungan</p><p className="text-xl font-bold text-green-600">{formatCurrency(data.customRangeStats.totalProfit)}</p></div>
                    <div><p className="text-sm text-muted-foreground">Total Transaksi</p><p className="text-xl font-bold">{data.customRangeStats.transactionCount}</p></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Produk Terlaris</CardTitle>
                    <CardDescription>Dalam rentang waktu yang dipilih.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                    {data.topSellingProducts.length > 0 ? data.topSellingProducts.map((product, index) => (
                        <li key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate pr-2">{index + 1}. {product.name}</span>
                        <span className="font-bold flex-shrink-0">{product.totalSold} terjual</span>
                        </li>
                    )) : (<p className="text-sm text-muted-foreground">Tidak ada data penjualan.</p>)}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}