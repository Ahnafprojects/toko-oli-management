// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log(`Mulai proses seeding...`);

  // --- Seeding Kategori ---
  const categoriesToSeed = [ { name: 'Oli Mesin Mobil' }, { name: 'Oli Mesin Motor' }, { name: 'Oli Gardan' }, { name: 'Minyak Rem' }, { name: 'Filter Oli' }, { name: 'Umum' } ];
  for (const cat of categoriesToSeed) {
    await prisma.category.upsert({ where: { name: cat.name }, update: {}, create: { name: cat.name } });
  }
  console.log('Seeding kategori selesai.');

  // --- Seeding Produk dari Excel ---
  console.log('Mulai impor produk dari Excel...');
  
  const filePath = path.join(__dirname, 'data_produk.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Mengubah sheet menjadi array dari array (baris dan kolom)
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const productsToCreate = [];
  
  // Mengambil kategori 'Umum' sebagai default
  const defaultCategory = await prisma.category.findUnique({ where: { name: 'Umum' } });
  if (!defaultCategory) {
    throw new Error("Kategori 'Umum' tidak ditemukan.");
  }

  // Iterasi melalui setiap baris, dimulai dari baris kedua (indeks 1) karena baris pertama adalah header
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Proses blok kolom pertama (A, B, C), kedua (E, F, G), ketiga (I, J, K), dst.
    for (let j = 0; j < row.length; j += 4) { // Melompat 4 kolom setiap kali
      const productName = row[j];
      const buyPrice = row[j + 1];
      const sellPrice = row[j + 2];

      // PENTING: Hanya proses jika semua data ada dan valid
      if (productName && typeof buyPrice === 'number' && typeof sellPrice === 'number') {
        productsToCreate.push({
          name: String(productName),
          buyPrice: new Prisma.Decimal(buyPrice),
          sellPrice: new Prisma.Decimal(sellPrice),
          unit: 'Botol', 
          categoryId: defaultCategory.id,
          stock: 0,
          minStock: 5,
        });
      } else if (productName) {
        // Beri peringatan jika ada produk dengan data harga yang hilang
        console.warn(`Melewati produk "${productName}" karena data harga tidak lengkap.`);
      }
    }
  }

  if (productsToCreate.length > 0) {
    // Masukkan semua produk yang valid ke database
    const result = await prisma.product.createMany({
      data: productsToCreate,
      skipDuplicates: true, // Lewati jika ada produk dengan nama yang sama
    });
    console.log(`${result.count} produk baru berhasil diimpor dari Excel.`);
  } else {
    console.log('Tidak ada produk valid yang ditemukan di file Excel untuk diimpor.');
  }

  console.log(`Seeding selesai total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });