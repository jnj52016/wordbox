import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PrismaService } from '../prisma/prisma.service'
import { StatisticsService } from './statistics.service'

describe('StatisticsService', () => {
  const prisma = {
    learner: { findUnique: vi.fn() },
    studySession: { findMany: vi.fn() },
    wordProgress: { count: vi.fn() },
    wordBook: { findFirst: vi.fn() },
  } as unknown as PrismaService
  const service = new StatisticsService(prisma)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.learner.findUnique).mockResolvedValue({
      id: 'learner-db-1',
      dailyGoal: 10,
    } as never)
    vi.mocked(prisma.studySession.findMany).mockResolvedValue([] as never)
    vi.mocked(prisma.wordProgress.count)
      .mockResolvedValueOnce(4 as never)
      .mockResolvedValueOnce(1 as never)
    vi.mocked(prisma.wordBook.findFirst).mockResolvedValue(null)
  })

  it('calculates today progress, streak, mastery and review counts', async () => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    vi.mocked(prisma.studySession.findMany).mockResolvedValue([
      { totalCount: 3, completedAt: now },
      { totalCount: 2, completedAt: yesterday },
    ] as never)
    vi.mocked(prisma.wordBook.findFirst).mockResolvedValue({
      id: 'book-1',
      name: '基础英语',
      units: [
        {
          _count: { words: 5 },
          words: [{ progresses: [{ id: 'progress-1' }] }, { progresses: [] }],
        },
      ],
    } as never)

    await expect(service.getDashboard({ learnerId: 'learner-1' })).resolves.toMatchObject({
      todayLearnedCount: 3,
      dailyGoal: 10,
      streakDays: 2,
      masteredWordCount: 4,
      reviewDueCount: 1,
      hasLearningHistory: true,
      currentWordBook: {
        id: 'book-1',
        totalWordCount: 5,
        masteredWordCount: 1,
        completionPercent: 20,
      },
    })
  })
})
