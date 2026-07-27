import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLearnerDto } from './dto/create-learner.dto'
import { LearnersService } from './learners.service'

describe('LearnersService', () => {
  const transaction = {
    learner: { findUnique: vi.fn() },
    wordProgress: { deleteMany: vi.fn() },
    studySession: { deleteMany: vi.fn() },
  }
  const prisma = {
    learner: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
    ),
  } as unknown as PrismaService

  const service = new LearnersService(prisma)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an anonymous learner or returns the existing one', async () => {
    const learner = {
      publicId: 'learner-1',
      dailyGoal: 10,
      autoPronounce: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    vi.mocked(prisma.learner.upsert).mockResolvedValue(learner as never)

    await expect(service.createOrGet({ publicId: 'learner-1' } as CreateLearnerDto)).resolves.toEqual(
      learner,
    )
    expect(prisma.learner.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { publicId: 'learner-1' },
        update: {},
        create: { publicId: 'learner-1' },
      }),
    )
  })

  it('updates learner settings', async () => {
    vi.mocked(prisma.learner.findUnique).mockResolvedValue({ publicId: 'learner-1' } as never)
    const updatedLearner = {
      publicId: 'learner-1',
      dailyGoal: 20,
      autoPronounce: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    }
    vi.mocked(prisma.learner.update).mockResolvedValue(updatedLearner as never)

    await expect(
      service.updateSettings('learner-1', { dailyGoal: 20, autoPronounce: false }),
    ).resolves.toEqual(updatedLearner)
  })

  it('resets progress and study sessions without deleting the learner', async () => {
    vi.mocked(transaction.learner.findUnique).mockResolvedValue({ id: 'learner-db-1' })
    vi.mocked(transaction.wordProgress.deleteMany).mockResolvedValue({ count: 12 })
    vi.mocked(transaction.studySession.deleteMany).mockResolvedValue({ count: 3 })

    await expect(service.resetProgress('learner-1')).resolves.toEqual({
      deletedProgressCount: 12,
      deletedSessionCount: 3,
    })
    expect(transaction.wordProgress.deleteMany).toHaveBeenCalledWith({
      where: { learnerId: 'learner-db-1' },
    })
    expect(transaction.studySession.deleteMany).toHaveBeenCalledWith({
      where: { learnerId: 'learner-db-1' },
    })
  })

  it('throws when reading an unknown learner', async () => {
    vi.mocked(prisma.learner.findUnique).mockResolvedValue(null)

    await expect(service.findByPublicId('missing')).rejects.toBeInstanceOf(NotFoundException)
  })
})
