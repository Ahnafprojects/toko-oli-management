// prisma/reset-data.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses penghapusan data...');

  // ⚠️ PENTING: Urutan penghapusan harus benar!
  // Hapus data dari tabel "anak" terlebih dahulu, baru ke tabel "induk".
  // Contoh: Hapus TransactionItem dulu, baru Transaction.

  // Ganti atau tambahkan model di bawah ini sesuai dengan schema.prisma Anda.
  // Urutkan dari yang paling banyak relasi ke yang paling sedikit.
  
  await prisma.transactionItem.deleteMany({});
  console.log('Semua data TransactionItem dihapus.');
  
  await prisma.transaction.deleteMany({});
  console.log('Semua data Transaction dihapus.');

  await prisma.product.deleteMany({});
  console.log('Semua data Product dihapus.');
  
  await prisma.category.deleteMany({});
  console.log('Semua data Category dihapus.');
  
  await prisma.user.deleteMany({});
  console.log('Semua data User dihapus.');

  // Tambahkan perintah .deleteMany({}) untuk setiap model lain yang Anda miliki...

  console.log('Proses penghapusan data selesai. ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });