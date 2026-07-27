import type { Word } from '../../../api/types'

export type LearningFeedback = 'unknown' | 'familiar' | 'known'

export function getInitialWordIds(words: Word[], limit = 10): string[] {
  return words.slice(0, limit).map((word) => word.id)
}

export function getNextQueue(queue: string[], feedback: LearningFeedback): string[] {
  const [currentId, ...remainingIds] = queue
  if (!currentId) {
    return []
  }

  return feedback === 'unknown' ? [...remainingIds, currentId] : remainingIds
}
