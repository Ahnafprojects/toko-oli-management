import { PrismaClient, Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log(`Mulai proses seeding...`);

  // --- 1. Seeding Kategori ---
  const categoriesToSeed = [ { name: 'Oli Mesin Mobil' }, { name: 'Oli Mesin Motor' }, { name: 'Oli Gardan' }, { name: 'Minyak Rem' }, { name: 'Filter Oli' }, { name: 'Umum' } ];
  for (const cat of categoriesToSeed) {
    await prisma.category.upsert({ where: { name: cat.name }, update: {}, create: { name: cat.name } });
  }
  const defaultCategory = await prisma.category.findUnique({ where: { name: 'Umum' } });
  if (!defaultCategory) {
    throw new Error("Kategori 'Umum' tidak ditemukan. Pastikan sudah ada di daftar seed.");
  }
  console.log('Seeding kategori selesai.');

  // --- 2. Seeding Produk dari Excel ---
  console.log('Mulai impor produk dari Excel...');
  
  const filePath = path.join(__dirname, 'data_produk.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  const productsToCreate = [];
  
  // Iterasi melalui setiap baris data Excel
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Proses setiap blok kolom (NAMA, AMBIL, HARGA) di dalam satu baris
    for (let j = 0; j < row.length; j += 4) { // Melompat 4 kolom (3 data + 1 pemisah)
      const productName = row[j];
      const buyPrice = row[j + 1];
      const sellPrice = row[j + 2];

      // --- LOGIKA BARU YANG LEBIH KETAT ---
      // Hanya proses jika Nama, Harga Beli, dan Harga Jual semuanya ada dan valid
      if (productName && typeof productName === 'string' && productName.trim() !== '' &&
          typeof buyPrice === 'number' && typeof sellPrice === 'number') {
        
        productsToCreate.push({
          name: String(productName).trim(),
          buyPrice: new Prisma.Decimal(buyPrice),
          sellPrice: new Prisma.Decimal(sellPrice),
          unit: 'Botol', 
          categoryId: defaultCategory.id,
          stock: 0,
          minStock: 5,
        });

      } else if (productName) {
        // Beri tahu produk mana yang dilewati karena datanya tidak lengkap
        console.warn(`- Melewati produk "${productName}" karena data harga tidak lengkap.`);
      }
    }
  }

  if (productsToCreate.length > 0) {
    console.log(`Mempersiapkan untuk mengimpor ${productsToCreate.length} produk yang valid...`);
    const result = await prisma.product.createMany({
      data: productsToCreate,
      skipDuplicates: true, // Lewati jika ada nama produk yang sama persis
    });
    console.log(`✅ ${result.count} produk baru berhasil diimpor dari Excel.`);
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