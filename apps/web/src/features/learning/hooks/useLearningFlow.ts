import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../api/client'
import type { ProgressFeedback, Word } from '../../../api/types'
import { queryKeys } from '../../../api/queryKeys'
import { useLearner } from '../../../learner/useLearner'
import {
  getInitialWordIds,
  getNextQueue,
  type LearningFeedback,
} from '../model/learningQueue'

const feedbackMap: Record<LearningFeedback, ProgressFeedback> = {
  unknown: 'UNKNOWN',
  familiar: 'FAMILIAR',
  known: 'KNOWN',
}

export function useLearningFlow(unitId?: string) {
  const navigate = useNavigate()
  const learnerQuery = useLearner()
  const wordsQuery = useQuery({
    queryKey: queryKeys.unitWords(unitId ?? ''),
    queryFn: () => api.getUnitWords(unitId ?? ''),
    enabled: Boolean(unitId),
  })
  const createSessionMutation = useMutation({ mutationFn: api.createStudySession })
  const feedbackMutation = useMutation({ mutationFn: api.submitProgressFeedback })
  const [queueIds, setQueueIds] = useState<string[] | null>(null)
  const [completedCount, setCompletedCount] = useState(0)
  const actionLock = useRef(false)

  const initialWords = useMemo(
    () => wordsQuery.data?.words.slice(0, 10) ?? [],
    [wordsQuery.data?.words],
  )
  const initialIds = useMemo(() => getInitialWordIds(initialWords), [initialWords])
  const activeIds = queueIds ?? initialIds
  const wordsById = useMemo(
    () => new Map((wordsQuery.data?.words ?? []).map((word) => [word.id, word])),
    [wordsQuery.data?.words],
  )
  const queue = activeIds
    .map((id) => wordsById.get(id))
    .filter((word): word is Word => Boolean(word))
  const currentWord = queue[0]

  useEffect(() => {
    setQueueIds(null)
    setCompletedCount(0)
    actionLock.current = false
  }, [unitId])

  const startQuiz = useCallback(() => {
    if (!unitId || !learnerQuery.data) {
      actionLock.current = false
      return
    }

    createSessionMutation.mutate(
      {
        learnerId: learnerQuery.publicId,
        unitId,
        count: initialWords.length,
      },
      {
        onSuccess: (session) => navigate(`/quiz/${session.id}`),
        onError: () => {
          actionLock.current = false
        },
      },
    )
  }, [createSessionMutation, initialWords.length, learnerQuery, navigate, unitId])

  const handleFeedback = useCallback(
    (feedback: LearningFeedback) => {
      if (
        !currentWord ||
        !learnerQuery.data ||
        actionLock.current ||
        createSessionMutation.isPending ||
        feedbackMutation.isPending
      ) {
        return
      }

      actionLock.current = true
      const wordId = currentWord.id

      feedbackMutation.mutate(
        {
          learnerId: learnerQuery.publicId,
          wordId,
          feedback: feedbackMap[feedback],
        },
        {
          onSuccess: () => {
            const remainingIds = getNextQueue(activeIds, feedback)

            if (feedback === 'unknown') {
              setQueueIds(remainingIds)
              window.setTimeout(() => {
                actionLock.current = false
              }, 250)
              return
            }

            setCompletedCount((count) => count + 1)
            setQueueIds(remainingIds)

            if (remainingIds.length === 0) {
              startQuiz()
              return
            }

            window.setTimeout(() => {
              actionLock.current = false
            }, 250)
          },
          onError: () => {
            actionLock.current = false
          },
        },
      )
    },
    [
      activeIds,
      createSessionMutation.isPending,
      currentWord,
      feedbackMutation,
      learnerQuery,
      startQuiz,
    ],
  )

  return {
    learnerQuery,
    wordsQuery,
    createSessionMutation,
    feedbackMutation,
    initialWords,
    queue,
    currentWord,
    completedCount,
    handleFeedback,
    startQuiz,
  }
}
