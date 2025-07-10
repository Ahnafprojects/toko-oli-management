'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Product, Category } from '@prisma/client';
import { cn } from '@/lib/utils';

interface ProductWithCategory extends Product {
  category: Category;
}

interface ProductSelectorProps {
  products: ProductWithCategory[];
  loading: boolean;
  onProductSelect: (product: ProductWithCategory) => void;
}

export default function ProductSelector({
  products,
  loading,
  onProductSelect,
}: ProductSelectorProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="p-4 flex flex-col justify-between h-40 space-y-3">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <Card
          key={product.id}
          className={cn(
            'rounded-lg border border-gray-200 shadow-sm transition-all duration-150 flex flex-col bg-white',
            product.stock > 0
              ? 'hover:ring-2 hover:ring-blue-500 hover:-translate-y-0.5 cursor-pointer'
              : 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => {
            if (product.stock > 0) onProductSelect(product);
          }}
        >
          <CardContent className="p-4 flex flex-col justify-between h-40">
            {/* Informasi Produk */}
            <div className="space-y-1">
              <p className="text-xs text-gray-400">{product.category.name}</p>
              <p className="text-sm font-semibold text-gray-800 leading-snug break-words">
                {product.name}
              </p>
            </div>

            {/* Harga dan Stok */}
            <div className="space-y-1 mt-3">
              <p className="text-blue-600 text-base font-bold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(Number(product.sellPrice))}
              </p>
              <p className="text-xs text-gray-600">
                Sisa stok: <span className="font-semibold">{product.stock}</span> ({product.unit})
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
