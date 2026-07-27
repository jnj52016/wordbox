import { beforeEach, describe, expect, it } from 'vitest'
import { getOrCreateLearnerId, LEARNER_ID_STORAGE_KEY } from './useLearner'

describe('getOrCreateLearnerId', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('creates and persists an id on first access', () => {
    const id = getOrCreateLearnerId()

    expect(id).toBeTruthy()
    expect(window.localStorage.getItem(LEARNER_ID_STORAGE_KEY)).toBe(id)
  })

  it('reuses the persisted id on later access', () => {
    window.localStorage.setItem(LEARNER_ID_STORAGE_KEY, 'saved-learner-id')

    expect(getOrCreateLearnerId()).toBe('saved-learner-id')
  })
})
