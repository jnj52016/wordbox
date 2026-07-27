const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

export type WordBook = {
  id: string
  slug: string
  name: string
  description: string | null
  level: string | null
  coverColor: string | null
  unitCount: number
  wordCount: number
}

export type UnitSummary = {
  id: string
  name: string
  order: number
  wordCount: number
}

export type WordBookDetail = WordBook & {
  units: UnitSummary[]
}

export type Word = {
  id: string
  spelling: string
  phonetic: string | null
  meaning: string
  partOfSpeech: string | null
  example: string | null
  exampleZh: string | null
  imageUrl: string | null
  emoji: string | null
  order: number
}

export type UnitWordsResponse = {
  unit: UnitSummary
  words: Word[]
  total: number
}

export type Learner = {
  publicId: string
  dailyGoal: number
  autoPronounce: boolean
  createdAt: string
  updatedAt: string
}

export type ResetProgressResponse = {
  deletedProgressCount: number
  deletedSessionCount: number
}

export type StudyMode = 'LEARN' | 'REVIEW'

export type QuestionType = 'EN_TO_ZH' | 'ZH_TO_EN' | 'SPELLING'

export type StudySession = {
  id: string
  learnerId: string
  unitId: string
  mode: StudyMode
  totalCount: number
  answeredCount: number
  correctCount: number
  startedAt: string
  completedAt: string | null
}

export type StudyQuestion = {
  questionId: string
  wordId: string
  questionType: QuestionType
  prompt: string
  phonetic: string | null
  emoji: string | null
  spelling?: string
  options: string[]
}

export type WordProgress = {
  status: 'NEW' | 'LEARNING' | 'MASTERED'
  correctStreak: number
  correctCount: number
  wrongCount: number
  nextReviewAt: string | null
}

export type StudyAnswerResult = {
  questionId: string
  questionType: QuestionType
  isCorrect: boolean
  correctAnswer: string
  duplicate: boolean
  progress: WordProgress
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  })

  if (!response.ok) {
    let message = `请求失败（${response.status}）`
    try {
      const body = (await response.json()) as { message?: string | string[] }
      if (typeof body.message === 'string') {
        message = body.message
      } else if (Array.isArray(body.message)) {
        message = body.message.join('、')
      }
    } catch {
      // Keep the HTTP status message when the API does not return JSON.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export const api = {
  listWordBooks: () => request<WordBook[]>('/word-books'),
  getWordBook: (id: string) => request<WordBookDetail>(`/word-books/${id}`),
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
    unitId: string
    mode?: StudyMode
    count?: number
  }) =>
    request<StudySession>('/study-sessions', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  getStudySession: (id: string) => request<StudySession>(`/study-sessions/${id}`),
  getStudyQuestions: (id: string) =>
    request<StudyQuestion[]>(`/study-sessions/${id}/questions`),
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
}
