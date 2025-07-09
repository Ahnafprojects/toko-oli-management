// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Home, ShoppingCart, Users, LogOut, Drum, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '../ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/transactions', label: 'Histori Transaksi', icon: History },
  { href: '/pos', label: 'Kasir (POS)', icon: ShoppingCart },
  { href: '/products', label: 'Produk & Stok', icon: Package },
  { href: '/drums', label: 'Drum', icon: Drum },
  { href: '/suppliers', label: 'Supplier', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-gray-700">
        Toko Oli Jaya
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              'flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            )}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* BAGIAN INFO USER & LOGOUT */}
      {session && (
        <div className="px-4 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-400">Login sebagai</p>
          <p className="text-sm font-medium truncate">{session.user?.email}</p>
          <Button 
            variant="ghost"
            className="w-full justify-start text-left mt-3 text-gray-300 hover:bg-red-600 hover:text-white"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      )}
    </aside>
  );
}