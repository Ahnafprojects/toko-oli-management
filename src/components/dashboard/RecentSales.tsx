// src/components/dashboard/RecentSales.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Anda mungkin perlu install: npx shadcn@latest add avatar

interface RecentSalesProps {
  sales: {
    id: string;
    user: { name: string | null; email: string | null };
    totalAmount: number;
  }[];
}

export default function RecentSales({ sales }: RecentSalesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Penjualan Terbaru</CardTitle>
        <CardDescription>5 transaksi terakhir yang terjadi.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sales.map((sale) => (
          <div key={sale.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{sale.user.name ? sale.user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{sale.user.name || sale.user.email}</p>
              <p className="text-sm text-muted-foreground">{sale.user.email}</p>
            </div>
            <div className="ml-auto font-medium">+Rp {sale.totalAmount.toLocaleString('id-ID')}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
