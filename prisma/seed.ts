// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Bagian ini akan membuat kategori jika belum ada
  await prisma.category.upsert({
    where: { name: 'Mesin Mobil' },
    update: {},
    create: { name: 'Mesin Mobil' },
  });

  await prisma.category.upsert({
    where: { name: 'Mesin Motor' },
    update: {},
    create: { name: 'Mesin Motor' },
  });

  await prisma.category.upsert({
    where: { name: 'Gardan' },
    update: {},
    create: { name: 'Gardan' },
  });

  console.log('Categories have been seeded.');

  // ... sisa kode untuk produk, dll.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });