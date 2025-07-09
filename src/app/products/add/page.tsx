// src/app/products/add/page.tsx
import ProductForm from "@/components/products/ProductForm";
import { Category } from "@prisma/client";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma"; // Import prisma client

// PERBAIKAN: Fungsi untuk mengambil data kategori langsung dari database
async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return categories;
  } catch (error) {
    console.error("Gagal mengambil data kategori:", error);
    // Return array kosong jika terjadi error agar halaman tidak rusak
    return []; 
  }
}

export default async function AddProductPage() {
  // Amankan halaman di sisi server
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const categories = await getCategories();

  // Tambahkan pengecekan jika kategori kosong untuk memberikan pesan yang jelas
  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gagal Memuat Data</h1>
        <p className="text-destructive">
          Tidak dapat memuat data kategori. Pastikan database Anda memiliki data kategori atau periksa koneksi database Anda.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tambah Produk Baru</h1>
        <p className="text-muted-foreground">
          Isi detail di bawah ini untuk menambahkan produk baru ke dalam inventaris Anda.
        </p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
