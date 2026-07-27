import { QuestionType, StudyMode, WordStatus } from '@prisma/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PrismaService } from '../prisma/prisma.service'
import { ProgressFeedback } from './dto/study.dto'
import { StudyService } from './study.service'

const session = {
  id: 'session-1',
  learnerId: 'learner-db-1',
  unitId: 'unit-1',
  mode: StudyMode.LEARN,
  totalCount: 3,
  correctCount: 0,
  startedAt: new Date('2026-07-27T12:00:00.000Z'),
  completedAt: null,
  learner: { publicId: 'learner-1' },
  _count: { answers: 0 },
}

const words = [
  {
    id: 'word-1',
    spelling: 'hello',
    phonetic: '/həˈloʊ/',
    meaning: '你好；喂',
    emoji: '👋',
    order: 1,
  },
  {
    id: 'word-2',
    spelling: 'thanks',
    phonetic: '/θæŋks/',
    meaning: '谢谢',
    emoji: '🙏',
    order: 2,
  },
  {
    id: 'word-3',
    spelling: 'goodbye',
    phonetic: '/ˌɡʊdˈbaɪ/',
    meaning: '再见',
    emoji: '👋',
    order: 3,
  },
]

describe('StudyService', () => {
  const transaction = {
    answerRecord: { findFirst: vi.fn(), create: vi.fn() },
    wordProgress: { findUnique: vi.fn(), upsert: vi.fn() },
    studySession: { update: vi.fn() },
  }
  const prisma = {
    learner: { findUnique: vi.fn() },
    unit: { findUnique: vi.fn() },
    word: { findMany: vi.fn(), findUnique: vi.fn() },
    wordProgress: { upsert: vi.fn() },
    studySession: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(async (callback: (tx: typeof transaction) => Promise<unknown>) =>
      callback(transaction),
    ),
  } as unknown as PrismaService
  const service = new StudyService(prisma)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(prisma.learner.findUnique).mockResolvedValue({ id: 'learner-db-1' } as never)
    vi.mocked(prisma.unit.findUnique).mockResolvedValue({ id: 'unit-1' } as never)
    vi.mocked(prisma.word.findMany).mockResolvedValue(words as never)
    vi.mocked(prisma.word.findUnique).mockResolvedValue({ id: 'word-1' } as never)
    vi.mocked(prisma.studySession.create).mockResolvedValue(session as never)
    vi.mocked(prisma.studySession.findUnique).mockResolvedValue(session as never)
  })

  it('creates a session with at most the requested number of ordered words', async () => {
    await expect(
      service.createSession({ learnerId: 'learner-1', unitId: 'unit-1', count: 3 }),
    ).resolves.toMatchObject({
      id: 'session-1',
      learnerId: 'learner-1',
      totalCount: 3,
    })
    expect(prisma.word.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 3, orderBy: { order: 'asc' } }),
    )
  })

  it('generates all three question types without exposing the standard answer', async () => {
    const questions = await service.getQuestions('session-1')

    expect(questions.map((question) => question.questionType)).toEqual([
      QuestionType.EN_TO_ZH,
      QuestionType.ZH_TO_EN,
      QuestionType.SPELLING,
    ])
    expect(questions[0].options).toContain('你好；喂')
    expect(questions[2].options).toEqual([])
    expect(questions[1]).not.toHaveProperty('meaning')
  })

  it('updates progress when an answer is submitted', async () => {
    transaction.answerRecord.findFirst.mockResolvedValue(null)
    transaction.wordProgress.findUnique.mockResolvedValue(null)
    transaction.answerRecord.create.mockResolvedValue({})
    transaction.wordProgress.upsert.mockResolvedValue({
      status: WordStatus.LEARNING,
      correctStreak: 1,
      correctCount: 1,
      wrongCount: 0,
      nextReviewAt: new Date('2026-07-28T12:00:00.000Z'),
    })

    await expect(
      service.submitAnswer('session-1', {
        questionId: 'session-1:word-1',
        questionType: QuestionType.EN_TO_ZH,
        answer: '你好；喂',
      }),
    ).resolves.toMatchObject({ isCorrect: true, duplicate: false })

    expect(transaction.answerRecord.create).toHaveBeenCalledOnce()
    expect(transaction.wordProgress.upsert).toHaveBeenCalledOnce()
    expect(transaction.studySession.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: { correctCount: { increment: 1 } },
    })
  })

  it('does not count a duplicate answer twice', async () => {
    transaction.answerRecord.findFirst.mockResolvedValue({
      questionType: QuestionType.EN_TO_ZH,
      isCorrect: true,
    })
    transaction.wordProgress.findUnique.mockResolvedValue({
      status: WordStatus.LEARNING,
      correctStreak: 1,
      correctCount: 1,
      wrongCount: 0,
      nextReviewAt: new Date('2026-07-28T12:00:00.000Z'),
    })

    await expect(
      service.submitAnswer('session-1', {
        questionId: 'session-1:word-1',
        questionType: QuestionType.EN_TO_ZH,
        answer: '你好；喂',
      }),
    ).resolves.toMatchObject({ isCorrect: true, duplicate: true })

    expect(transaction.answerRecord.create).not.toHaveBeenCalled()
    expect(transaction.wordProgress.upsert).not.toHaveBeenCalled()
    expect(transaction.studySession.update).not.toHaveBeenCalled()
  })

  it('completes a session only after all questions have answers', async () => {
    const completedAt = new Date('2026-07-27T12:10:00.000Z')
    vi.mocked(prisma.studySession.findUnique).mockResolvedValue({
      ...session,
      _count: { answers: 3 },
    } as never)
    vi.mocked(prisma.studySession.update).mockResolvedValue({
      ...session,
      _count: { answers: 3 },
      completedAt,
    } as never)

    await expect(service.completeSession('session-1')).resolves.toMatchObject({
      id: 'session-1',
      answeredCount: 3,
      completedAt,
    })
    expect(prisma.studySession.update).toHaveBeenCalledOnce()
  })

  it('persists card feedback for the next review', async () => {
    vi.mocked(prisma.wordProgress.upsert).mockResolvedValue({
      status: WordStatus.LEARNING,
      correctStreak: 0,
      correctCount: 0,
      wrongCount: 0,
      nextReviewAt: new Date('2026-07-28T12:00:00.000Z'),
    } as never)

    await expect(
      service.submitProgressFeedback({
        learnerId: 'learner-1',
        wordId: 'word-1',
        feedback: ProgressFeedback.FAMILIAR,
      }),
    ).resolves.toMatchObject({ status: WordStatus.LEARNING })

    expect(prisma.wordProgress.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { learnerId_wordId: { learnerId: 'learner-db-1', wordId: 'word-1' } },
      }),
    )
  })
})
