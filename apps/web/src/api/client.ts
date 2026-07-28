import { request } from './http'
import type {
  Dashboard,
  Learner,
  ProgressFeedback,
  QuestionType,
  ResetProgressResponse,
  ReviewQueue,
  StudyAnswerResult,
  StudyMode,
  StudyQuestion,
  StudyResult,
  StudySession,
  UnitDetail,
  UnitWordsResponse,
  WordBook,
  WordBookDetail,
  WordProgress,
} from './types'

export const api = {
  listWordBooks: () => request<WordBook[]>('/word-books'),
  getWordBook: (id: string) => request<WordBookDetail>(`/word-books/${id}`),
  getUnit: (id: string) => request<UnitDetail>(`/units/${id}`),
  getUnitWords: (id: string) => request<UnitWordsResponse>(`/units/${id}/words`),
  ensureLearner: (publicId: string) =>
    request<Learner>('/learners', {
      method: 'POST',
      body: JSON.stringify({ publicId }),
    }),
  updateLearnerSettings: (
    publicId: string,
    settings: { dailyGoal?: number; autoPronounce?: boolean },
  ) =>
    request<Learner>(`/learners/${publicId}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    }),
  resetLearnerProgress: (publicId: string) =>
    request<ResetProgressResponse>(`/learners/${publicId}/progress`, {
      method: 'DELETE',
    }),
  createStudySession: (input: {
    learnerId: string
    unitId?: string
    mode?: StudyMode
    count?: number
    sourceSessionId?: string
  }) =>
    request<StudySession>('/study-sessions', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  getStudySession: (id: string) => request<StudySession>(`/study-sessions/${id}`),
  getStudyResult: (id: string) => request<StudyResult>(`/study-sessions/${id}/result`),
  getReviewQueue: (learnerId: string) =>
    request<ReviewQueue>(`/review-queue?learnerId=${encodeURIComponent(learnerId)}`),
  getDashboard: (learnerId: string) =>
    request<Dashboard>(`/dashboard?learnerId=${encodeURIComponent(learnerId)}`),
  getStudyQuestions: (id: string) => request<StudyQuestion[]>(`/study-sessions/${id}/questions`),
  submitStudyAnswer: (
    id: string,
    answer: { questionId: string; questionType: QuestionType; answer: string },
  ) =>
    request<StudyAnswerResult>(`/study-sessions/${id}/answers`, {
      method: 'POST',
      body: JSON.stringify(answer),
    }),
  completeStudySession: (id: string) =>
    request<StudySession>(`/study-sessions/${id}/complete`, {
      method: 'POST',
    }),
  submitProgressFeedback: (input: {
    learnerId: string
    wordId: string
    feedback: ProgressFeedback
  }) =>
    request<WordProgress>('/progress/feedback', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  markProgressMastered: (input: { learnerId: string; wordId: string }) =>
    request<WordProgress>('/progress/master', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}

export type {
  Dashboard,
  Learner,
  ProgressFeedback,
  QuestionType,
  ResetProgressResponse,
  ReviewQueue,
  StudyAnswerResult,
  StudyMode,
  StudyQuestion,
  StudyResult,
  StudySession,
  UnitDetail,
  UnitWordsResponse,
  WordBook,
  WordBookDetail,
  WordProgress,
} from './types'
