'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  Home,
  ShoppingCart,
  Users,
  LogOut,
  Drum,
  History,
  Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '../ui/button';

const navItems = [
   { href: '/home', label: 'Menu Utama', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/transactions', label: 'Histori Transaksi', icon: History },
  { href: '/stock-history', label: 'Histori Stok', icon: Archive }, // ✅ Tambahan baru
  { href: '/pos', label: 'Kasir (POS)', icon: ShoppingCart },
  { href: '/products', label: 'Produk & Stok', icon: Package },
  { href: '/drums', label: 'Drum', icon: Drum },
  { href: '/suppliers', label: 'Supplier', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 tracking-wide">
          UD DOUBLE M
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-700'
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer - User Info + Logout */}
      {session && (
        <div className="px-4 py-5 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-400 mb-1">Login sebagai</div>
          <p className="text-sm font-medium text-gray-800 truncate">{session.user?.email}</p>

          <Button
            variant="ghost"
            className="mt-3 w-full justify-start text-sm text-gray-600 hover:bg-red-100 hover:text-red-600"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </aside>
  );
}
