const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const path = require('path');

const dbPath = path.resolve(process.cwd(), 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const items = await prisma.collectionItem.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const seen = new Set();
  let deleted = 0;

  for (const item of items) {
    const key = `${item.collectionId}:${item.animeId}`;
    if (seen.has(key)) {
      await prisma.collectionItem.delete({ where: { id: item.id } });
      deleted++;
    } else {
      seen.add(key);
    }
  }

  console.log(`Cleaned up ${deleted} duplicate collection items.`);
  await prisma.$disconnect();
}

main().catch(console.error);
