// src/components/pos/ProductSelector.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Product, Category } from '@prisma/client';
import { cn } from '@/lib/utils';

// Tipe ini diperlukan karena kita menyertakan data kategori
interface ProductWithCategory extends Product {
  category: Category;
}

interface ProductSelectorProps {
  products: ProductWithCategory[];
  loading: boolean;
  // Prop baru untuk menangani saat produk dipilih
  onProductSelect: (product: ProductWithCategory) => void;
}

export default function ProductSelector({ products, loading, onProductSelect }: ProductSelectorProps) {
  if (loading) {
    // Tampilan skeleton saat data sedang dimuat
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="p-4 flex flex-col justify-between h-40">
              <div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
              </div>
              <div className="mt-auto">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mt-2"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className={cn(
            'overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col',
            product.stock > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          )}
          onClick={() => {
            if (product.stock > 0) {
              onProductSelect(product);
            }
          }}
        >
          <CardContent className="p-4 flex flex-col justify-between flex-grow">
            <div>
              <h3 className="font-semibold text-base" title={product.name}>
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground">{product.category.name}</p>
            </div>
            <div className="mt-4">
              <p className="font-bold text-blue-600 text-lg">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(product.sellPrice))}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Sisa Stok: {product.stock} ({product.unit})
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
