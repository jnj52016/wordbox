import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const wordBook = await prisma.wordBook.upsert({
    where: { slug: 'starter' },
    update: {
      name: 'WordBox Starter',
      description: 'WordBox 默认入门词书',
      level: 'BEGINNER',
      coverColor: '#2563eb',
    },
    create: {
      slug: 'starter',
      name: 'WordBox Starter',
      description: 'WordBox 默认入门词书',
      level: 'BEGINNER',
      coverColor: '#2563eb',
    },
  })

  for (let order = 1; order <= 5; order += 1) {
    await prisma.unit.upsert({
      where: {
        wordBookId_order: {
          wordBookId: wordBook.id,
          order,
        },
      },
      update: {
        name: `Unit ${order}`,
      },
      create: {
        wordBookId: wordBook.id,
        name: `Unit ${order}`,
        order,
      },
    })
  }

  console.log(`Seeded word book "${wordBook.slug}" and 5 units.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
