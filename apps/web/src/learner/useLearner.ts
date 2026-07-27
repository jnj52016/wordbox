import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { queryKeys } from '../api/queryKeys'

export const LEARNER_ID_STORAGE_KEY = 'wordbox:learnerId'

function createLearnerId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function getOrCreateLearnerId(storage?: Storage): string {
  const learnerStorage =
    storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined)
  const existingId = learnerStorage?.getItem(LEARNER_ID_STORAGE_KEY)

  if (existingId) {
    return existingId
  }

  const newId = createLearnerId()
  learnerStorage?.setItem(LEARNER_ID_STORAGE_KEY, newId)
  return newId
}

export function useLearner() {
  const [publicId] = useState(() => getOrCreateLearnerId())
  const query = useQuery({
    queryKey: queryKeys.learner(publicId),
    queryFn: () => api.ensureLearner(publicId),
  })

  return { publicId, ...query }
}
