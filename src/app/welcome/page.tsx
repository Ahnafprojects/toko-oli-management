// src/app/welcome/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutDashboard, ShoppingCart } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Selamat Datang!</CardTitle>
          <CardDescription>Login berhasil. Silakan pilih tujuan Anda.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Buka Dashboard
            </Button>
          </Link>
          <Link href="/pos">
            <Button variant="secondary" size="lg">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Pergi ke Kasir
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}