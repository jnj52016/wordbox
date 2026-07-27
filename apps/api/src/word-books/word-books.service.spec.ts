import { NotFoundException } from '@nestjs/common'
import { describe, expect, it, vi } from 'vitest'
import { PrismaService } from '../prisma/prisma.service'
import { WordBooksService } from './word-books.service'

describe('WordBooksService', () => {
  const prisma = {
    wordBook: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    unit: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  } as unknown as PrismaService

  const service = new WordBooksService(prisma)

  it('returns word books with unit and word counts', async () => {
    vi.mocked(prisma.wordBook.findMany).mockResolvedValue([
      {
        id: 'book-1',
        slug: 'starter',
        name: 'WordBox 入门词书',
        description: 'description',
        level: 'BEGINNER',
        coverColor: '#2563eb',
        units: [{ _count: { words: 20 } }, { _count: { words: 20 } }],
      },
    ] as never)

    await expect(service.findAll()).resolves.toEqual([
      expect.objectContaining({
        id: 'book-1',
        unitCount: 2,
        wordCount: 40,
      }),
    ])
  })

  it('returns a word book detail with ordered unit summaries', async () => {
    vi.mocked(prisma.wordBook.findUnique).mockResolvedValue({
      id: 'book-1',
      slug: 'starter',
      name: 'WordBox 入门词书',
      description: null,
      level: 'BEGINNER',
      coverColor: '#2563eb',
      units: [{ id: 'unit-1', name: '日常基础', order: 1, _count: { words: 20 } }],
    } as never)

    await expect(service.findOne('book-1')).resolves.toEqual(
      expect.objectContaining({
        id: 'book-1',
        units: [expect.objectContaining({ id: 'unit-1', wordCount: 20 })],
        wordCount: 20,
      }),
    )
  })

  it('throws when the requested word book does not exist', async () => {
    vi.mocked(prisma.wordBook.findUnique).mockResolvedValue(null)

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('returns ordered words for a unit', async () => {
    vi.mocked(prisma.unit.findUnique).mockResolvedValue({
      id: 'unit-1',
      name: '日常基础',
      order: 1,
      _count: { words: 1 },
      words: [
        {
          id: 'word-1',
          spelling: 'hello',
          phonetic: '/həˈloʊ/',
          meaning: '你好；喂',
          partOfSpeech: 'interjection',
          example: 'Hello, how are you?',
          exampleZh: '你好，你怎么样？',
          imageUrl: null,
          emoji: '👋',
          order: 1,
        },
      ],
    } as never)

    await expect(service.findUnitWords('unit-1')).resolves.toEqual(
      expect.objectContaining({
        total: 1,
        unit: expect.objectContaining({ wordCount: 1 }),
        words: [expect.objectContaining({ spelling: 'hello' })],
      }),
    )
  })

  it('returns the next unit when one exists', async () => {
    vi.mocked(prisma.unit.findUnique).mockResolvedValue({
      id: 'unit-1',
      wordBookId: 'book-1',
      name: '日常基础',
      order: 1,
      _count: { words: 20 },
    } as never)
    vi.mocked(prisma.unit.findFirst).mockResolvedValue({ id: 'unit-2' } as never)

    await expect(service.findUnit('unit-1')).resolves.toEqual({
      id: 'unit-1',
      wordBookId: 'book-1',
      name: '日常基础',
      order: 1,
      wordCount: 20,
      nextUnitId: 'unit-2',
    })
  })
})
