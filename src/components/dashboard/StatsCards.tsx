// src/components/dashboard/StatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PeriodStats {
  totalSales: number;
  totalProfit: number;
}

interface StatsCardsProps {
  stats: {
    today: PeriodStats;
    last7Days: PeriodStats;
    last30Days: PeriodStats;
  };
}

const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

function StatCard({
  title,
  sales,
  profit,
}: {
  title: string;
  sales: number;
  profit: number;
}) {
  return (
    <Card className="rounded-xl shadow-sm border border-gray-200 transition hover:shadow-md bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-gray-700 tracking-tight">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        <div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(sales)}</div>
          <p className="text-xs text-gray-500">Total Penjualan</p>
        </div>
        <Separator />
        <div>
          <div className="text-lg font-semibold text-green-600">{formatCurrency(profit)}</div>
          <p className="text-xs text-gray-500">Estimasi Keuntungan</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const periods = [
    { title: 'Hari Ini', data: stats.today },
    { title: '7 Hari Terakhir', data: stats.last7Days },
    { title: '30 Hari Terakhir', data: stats.last30Days },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {periods.map((period) => (
        <StatCard
          key={period.title}
          title={period.title}
          sales={period.data.totalSales}
          profit={period.data.totalProfit}
        />
      ))}
    </div>
  );
}
