import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type WordInput = {
  order: number
  spelling: string
  phonetic: string
  meaning: string
  partOfSpeech: string
  example: string
  exampleZh: string
  imageUrl: string | null
  emoji: string | null
}

type UnitInput = {
  order: number
  name: string
  words: WordInput[]
}

type SeedData = {
  wordBook: {
    slug: string
    name: string
    description: string
    level: string
    coverColor: string
  }
  units: UnitInput[]
}

type SeedStats = {
  created: number
  updated: number
  skipped: number
  failed: number
}

type ExistingWord = {
  spelling: string
  phonetic: string | null
  meaning: string
  partOfSpeech: string | null
  example: string | null
  exampleZh: string | null
  imageUrl: string | null
  emoji: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} must be a non-empty string`)
  }

  return value.trim()
}

function optionalString(value: unknown, field: string): string | null {
  if (value === undefined || value === null) {
    return null
  }

  return requiredString(value, field)
}

function positiveInteger(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error(`${field} must be a positive integer`)
  }

  return value
}

function parseWord(value: unknown, path: string): WordInput {
  if (!isRecord(value)) {
    throw new Error(`${path} must be an object`)
  }

  return {
    order: positiveInteger(value.order, `${path}.order`),
    spelling: requiredString(value.spelling, `${path}.spelling`),
    phonetic: requiredString(value.phonetic, `${path}.phonetic`),
    meaning: requiredString(value.meaning, `${path}.meaning`),
    partOfSpeech: requiredString(value.partOfSpeech, `${path}.partOfSpeech`),
    example: requiredString(value.example, `${path}.example`),
    exampleZh: requiredString(value.exampleZh, `${path}.exampleZh`),
    imageUrl: optionalString(value.imageUrl, `${path}.imageUrl`),
    emoji: optionalString(value.emoji, `${path}.emoji`),
  }
}

function parseSeedData(value: unknown): SeedData {
  if (!isRecord(value) || !isRecord(value.wordBook) || !Array.isArray(value.units)) {
    throw new Error('Seed data must contain a wordBook object and a units array')
  }

  const wordBook = value.wordBook
  const units = value.units.map((unitValue, unitIndex) => {
    const path = `units[${unitIndex}]`
    if (!isRecord(unitValue) || !Array.isArray(unitValue.words)) {
      throw new Error(`${path} must contain a words array`)
    }

    const unit = {
      order: positiveInteger(unitValue.order, `${path}.order`),
      name: requiredString(unitValue.name, `${path}.name`),
      words: unitValue.words.map((wordValue, wordIndex) =>
        parseWord(wordValue, `${path}.words[${wordIndex}]`),
      ),
    }

    if (unit.words.length === 0) {
      throw new Error(`${path}.words must not be empty`)
    }

    const wordOrders = new Set<number>()
    const spellings = new Set<string>()
    for (const word of unit.words) {
      if (wordOrders.has(word.order)) {
        throw new Error(`${path} contains duplicate word order ${word.order}`)
      }
      wordOrders.add(word.order)

      const spelling = word.spelling.toLowerCase()
      if (spellings.has(spelling)) {
        throw new Error(`${path} contains duplicate spelling "${word.spelling}"`)
      }
      spellings.add(spelling)
    }

    return unit
  })

  const unitOrders = new Set<number>()
  for (const unit of units) {
    if (unitOrders.has(unit.order)) {
      throw new Error(`Seed data contains duplicate unit order ${unit.order}`)
    }
    unitOrders.add(unit.order)
  }

  return {
    wordBook: {
      slug: requiredString(wordBook.slug, 'wordBook.slug'),
      name: requiredString(wordBook.name, 'wordBook.name'),
      description: requiredString(wordBook.description, 'wordBook.description'),
      level: requiredString(wordBook.level, 'wordBook.level'),
      coverColor: requiredString(wordBook.coverColor, 'wordBook.coverColor'),
    },
    units,
  }
}

function loadSeedData(): SeedData {
  const filePath = resolve(__dirname, '../../../data/words.json')
  const file = readFileSync(filePath, 'utf8')
  return parseSeedData(JSON.parse(file) as unknown)
}

function wordMatches(existing: ExistingWord, desired: WordInput): boolean {
  return (
    existing.spelling === desired.spelling &&
    existing.phonetic === desired.phonetic &&
    existing.meaning === desired.meaning &&
    existing.partOfSpeech === desired.partOfSpeech &&
    existing.example === desired.example &&
    existing.exampleZh === desired.exampleZh &&
    (existing.imageUrl ?? null) === desired.imageUrl &&
    (existing.emoji ?? null) === desired.emoji
  )
}

async function main() {
  const stats: SeedStats = { created: 0, updated: 0, skipped: 0, failed: 0 }

  try {
    const data = loadSeedData()

    await prisma.$transaction(async (tx) => {
      const wordBook = await tx.wordBook.upsert({
        where: { slug: data.wordBook.slug },
        update: data.wordBook,
        create: data.wordBook,
      })

      for (const unit of data.units) {
        const savedUnit = await tx.unit.upsert({
          where: {
            wordBookId_order: {
              wordBookId: wordBook.id,
              order: unit.order,
            },
          },
          update: { name: unit.name },
          create: {
            wordBookId: wordBook.id,
            name: unit.name,
            order: unit.order,
          },
        })

        for (const word of unit.words) {
          const existing = await tx.word.findUnique({
            where: {
              unitId_order: {
                unitId: savedUnit.id,
                order: word.order,
              },
            },
          })

          if (existing && wordMatches(existing, word)) {
            stats.skipped += 1
            continue
          }

          if (existing) {
            await tx.word.update({
              where: { id: existing.id },
              data: word,
            })
            stats.updated += 1
            continue
          }

          await tx.word.create({
            data: {
              ...word,
              unitId: savedUnit.id,
            },
          })
          stats.created += 1
        }
      }
    })

    const totalWords = data.units.reduce((total, unit) => total + unit.words.length, 0)
    console.log(
      `Seeded "${data.wordBook.slug}" with ${data.units.length} units and ${totalWords} words.`,
    )
    console.log(
      `Words: created=${stats.created}, updated=${stats.updated}, skipped=${stats.skipped}, failed=${stats.failed}`,
    )
  } catch (error) {
    stats.failed += 1
    console.error('Seed failed:', error)
    console.log(
      `Words: created=${stats.created}, updated=${stats.updated}, skipped=${stats.skipped}, failed=${stats.failed}`,
    )
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

void main()
