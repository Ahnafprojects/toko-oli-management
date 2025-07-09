// src/app/products/edit/[id]/page.tsx
import ProductForm from "@/components/products/ProductForm";
import prisma from "@/lib/prisma";
import { Category, Product } from "@prisma/client";

// Tipe data yang aman untuk dikirim ke komponen client
export type SafeProductForForm = Omit<Product, 'buyPrice' | 'sellPrice' | 'createdAt' | 'updatedAt' | 'expiredDate'> & {
  buyPrice: number;
  sellPrice: number;
  createdAt: string;
  updatedAt: string;
  expiredDate: string | null;
};

async function getProduct(id: string): Promise<SafeProductForForm | null> {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  if (!product) return null;
  
  // Konversi tipe data yang tidak aman (Decimal, Date) menjadi tipe yang aman (number, string)
  return {
    ...product,
    buyPrice: product.buyPrice.toNumber(),
    sellPrice: product.sellPrice.toNumber(),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    expiredDate: product.expiredDate ? product.expiredDate.toISOString() : null,
  };
}

async function getCategories(): Promise<Category[]> {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    getProduct(params.id),
    getCategories(),
  ]);

  if (!product) {
    return <div>Produk tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Produk</h1>
        <p className="text-muted-foreground">
          Perbarui detail produk di bawah ini.
        </p>
      </div>
      <ProductForm categories={categories} initialData={product} />
    </div>
  );
}
