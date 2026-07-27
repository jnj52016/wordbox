import { WordStatus } from '@prisma/client'

const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30]

export type ProgressState = {
  status: WordStatus
  correctStreak: number
  correctCount: number
  wrongCount: number
}

export type ProgressUpdate = ProgressState & {
  lastSeenAt: Date
  nextReviewAt: Date
}

export function getReviewIntervalDays(correctStreak: number): number {
  if (correctStreak <= 1) {
    return REVIEW_INTERVAL_DAYS[0]
  }

  return REVIEW_INTERVAL_DAYS[Math.min(correctStreak - 1, REVIEW_INTERVAL_DAYS.length - 1)]
}

export function calculateProgressUpdate(
  current: ProgressState,
  isCorrect: boolean,
  now: Date,
): ProgressUpdate {
  const correctStreak = isCorrect ? current.correctStreak + 1 : 0
  const intervalDays = getReviewIntervalDays(correctStreak)
  const nextReviewAt = new Date(now)
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays)

  return {
    status: isCorrect && correctStreak >= 3 ? WordStatus.MASTERED : WordStatus.LEARNING,
    correctStreak,
    correctCount: current.correctCount + (isCorrect ? 1 : 0),
    wrongCount: current.wrongCount + (isCorrect ? 0 : 1),
    lastSeenAt: now,
    nextReviewAt,
  }
}
