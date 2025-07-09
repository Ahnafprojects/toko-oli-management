// src/components/dashboard/SalesChart.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface SalesChartProps {
  data: { name: string; total: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Penjualan 7 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#888888" fontSize={12} />
            <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `Rp${Number(value) / 1000}k`} />
            <Tooltip formatter={(value) => [`Rp${Number(value).toLocaleString('id-ID')}`, "Total"]} />
            <Line type="monotone" dataKey="total" stroke="#1d4ed8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
