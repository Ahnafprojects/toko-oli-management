// src/components/dashboard/StatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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

const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function StatCard({ title, sales, profit }: { title: string, sales: number, profit: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">{formatCurrency(sales)}</div>
        <p className="text-xs text-muted-foreground">Total Penjualan</p>
        <Separator />
        <div className="text-lg font-semibold text-green-600">{formatCurrency(profit)}</div>
        <p className="text-xs text-muted-foreground">Estimasi Keuntungan</p>
      </CardContent>
    </Card>
  );
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const periods = [
    { title: "Hari Ini", data: stats.today },
    { title: "7 Hari Terakhir", data: stats.last7Days },
    { title: "30 Hari Terakhir", data: stats.last30Days },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {periods.map(period => (
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
