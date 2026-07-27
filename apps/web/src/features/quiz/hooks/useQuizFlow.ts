import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../api/client'
import type { StudyAnswerResult, StudyQuestion } from '../../../api/types'
import { queryKeys } from '../../../api/queryKeys'

export function useQuizFlow(sessionId?: string) {
  const navigate = useNavigate()
  const sessionQuery = useQuery({
    queryKey: queryKeys.studySession(sessionId ?? ''),
    queryFn: () => api.getStudySession(sessionId ?? ''),
    enabled: Boolean(sessionId),
  })
  const questionsQuery = useQuery({
    queryKey: queryKeys.studyQuestions(sessionId ?? ''),
    queryFn: () => api.getStudyQuestions(sessionId ?? ''),
    enabled: Boolean(sessionId),
  })
  const answerMutation = useMutation({
    mutationFn: (input: {
      questionId: string
      questionType: StudyQuestion['questionType']
      answer: string
    }) => api.submitStudyAnswer(sessionId ?? '', input),
  })
  const completeMutation = useMutation({
    mutationFn: () => api.completeStudySession(sessionId ?? ''),
  })
  const [questionIndex, setQuestionIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [answerResult, setAnswerResult] = useState<StudyAnswerResult | null>(null)

  const questions = questionsQuery.data ?? []
  const question = questions[questionIndex]

  useEffect(() => {
    setInputValue('')
    setAnswerResult(null)
  }, [question?.questionId])

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!question || !sessionId || answerResult || answerMutation.isPending || !answer.trim()) {
        return
      }

      answerMutation.mutate(
        {
          questionId: question.questionId,
          questionType: question.questionType,
          answer,
        },
        {
          onSuccess: (result) => setAnswerResult(result),
        },
      )
    },
    [answerMutation, answerResult, question, sessionId],
  )

  const goToNextQuestion = useCallback(() => {
    if (!sessionId || !answerResult) {
      return
    }

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((index) => index + 1)
      return
    }

    completeMutation.mutate(undefined, {
      onSuccess: (session) => navigate(`/result/${session.id}`),
    })
  }, [answerResult, completeMutation, navigate, questionIndex, questions.length, sessionId])

  return {
    sessionQuery,
    questionsQuery,
    answerMutation,
    completeMutation,
    questions,
    question,
    questionIndex,
    inputValue,
    setInputValue,
    answerResult,
    submitAnswer,
    goToNextQuestion,
  }
}
