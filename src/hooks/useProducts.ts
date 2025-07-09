// src/hooks/useProducts.ts
'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '@prisma/client';

// Definisikan tipe gabungan yang sesuai dengan hasil query API
export interface ProductWithCategory extends Product {
  category: Category;
}

export function useProducts() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Gagal mengambil data produk');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}