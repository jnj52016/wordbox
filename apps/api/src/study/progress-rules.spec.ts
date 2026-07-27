import { WordStatus } from '@prisma/client'
import { describe, expect, it } from 'vitest'
import { calculateProgressUpdate, getReviewIntervalDays } from './progress-rules'

describe('progress rules', () => {
  it('uses the planned review intervals', () => {
    expect([1, 2, 3, 4, 5, 6].map(getReviewIntervalDays)).toEqual([1, 3, 7, 14, 30, 30])
  })

  it('marks a word as mastered after three consecutive correct answers', () => {
    const now = new Date('2026-07-27T12:00:00.000Z')

    expect(
      calculateProgressUpdate(
        {
          status: WordStatus.LEARNING,
          correctStreak: 2,
          correctCount: 2,
          wrongCount: 0,
        },
        true,
        now,
      ),
    ).toEqual({
      status: WordStatus.MASTERED,
      correctStreak: 3,
      correctCount: 3,
      wrongCount: 0,
      lastSeenAt: now,
      nextReviewAt: new Date('2026-08-03T12:00:00.000Z'),
    })
  })

  it('resets the streak and schedules a wrong answer for the next day', () => {
    const now = new Date('2026-07-27T12:00:00.000Z')

    expect(
      calculateProgressUpdate(
        {
          status: WordStatus.MASTERED,
          correctStreak: 3,
          correctCount: 3,
          wrongCount: 0,
        },
        false,
        now,
      ),
    ).toMatchObject({
      status: WordStatus.LEARNING,
      correctStreak: 0,
      correctCount: 3,
      wrongCount: 1,
      nextReviewAt: new Date('2026-07-28T12:00:00.000Z'),
    })
  })
})
