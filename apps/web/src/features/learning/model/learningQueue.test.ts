import { describe, expect, it } from 'vitest'
import type { Word } from '../../../api/types'
import { getInitialWordIds, getNextQueue } from './learningQueue'

describe('learningQueue', () => {
  it('limits the initial learning round to ten words', () => {
    const manyWords = Array.from({ length: 12 }, (_, index) => ({
      id: `word-${index}`,
    })) as unknown as Word[]

    expect(getInitialWordIds(manyWords)).toHaveLength(10)
  })

  it('moves an unfamiliar word to the end of the queue', () => {
    expect(getNextQueue(['word-1', 'word-2', 'word-3'], 'unknown')).toEqual([
      'word-2',
      'word-3',
      'word-1',
    ])
  })

  it('removes familiar and known words from the queue', () => {
    expect(getNextQueue(['word-1', 'word-2', 'word-3'], 'familiar')).toEqual([
      'word-2',
      'word-3',
    ])
    expect(getNextQueue(['word-1', 'word-2'], 'known')).toEqual(['word-2'])
  })

  it('returns an empty queue when there is no current word', () => {
    expect(getNextQueue([], 'known')).toEqual([])
  })
})
