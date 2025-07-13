import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Mulai proses seeding ...`);

  // Menggunakan upsert untuk membuat kategori jika belum ada, atau membiarkannya jika sudah ada.
  // Ini lebih aman daripada menghapus semua data.
  const categories = [
    { name: 'Oli Mesin Mobil' },
    { name: 'Oli Mesin Motor' },
    { name: 'Oli Gardan' },
    { name: 'Minyak Rem' },
    { name: 'Filter Oli' },
    { name: 'Lainnya' },
  ];

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
    console.log(`Kategori '${category.name}' berhasil dibuat/ditemukan.`);
  }

  console.log(`Seeding selesai.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });