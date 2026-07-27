import { WordStatus } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PrismaService } from '../prisma/prisma.service'
import { ReviewService } from './review.service'

describe('ReviewService', () => {
  const prisma = {
    learner: { findUnique: vi.fn() },
    wordProgress: { findMany: vi.fn() },
  } as unknown as PrismaService
  const service = new ReviewService(prisma)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.learner.findUnique).mockResolvedValue({ id: 'learner-db-1' } as never)
  })

  it('returns due words ordered by review time and mistakes', async () => {
    const nextReviewAt = new Date('2026-07-27T12:00:00.000Z')
    vi.mocked(prisma.wordProgress.findMany).mockResolvedValue([
      {
        status: WordStatus.LEARNING,
        correctCount: 1,
        wrongCount: 2,
        lastSeenAt: new Date('2026-07-26T12:00:00.000Z'),
        nextReviewAt,
        word: {
          id: 'word-1',
          spelling: 'hello',
          phonetic: '/həˈloʊ/',
          meaning: '你好；喂',
          partOfSpeech: 'interjection',
          example: 'Hello, everyone.',
          exampleZh: '大家好。',
          imageUrl: null,
          emoji: '👋',
        },
      },
    ] as never)

    await expect(service.findQueue({ learnerId: 'learner-1' })).resolves.toMatchObject({
      total: 1,
      words: [{ id: 'word-1', wrongCount: 2, nextReviewAt }],
    })
    expect(prisma.wordProgress.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { learnerId: 'learner-db-1', nextReviewAt: { lte: expect.any(Date) } },
      }),
    )
  })
})
