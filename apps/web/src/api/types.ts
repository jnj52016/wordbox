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

export type UnitDetail = UnitSummary & {
  wordBookId: string
  nextUnitId: string | null
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

export type ProgressFeedback = 'UNKNOWN' | 'FAMILIAR' | 'KNOWN'

export type StudySession = {
  id: string
  learnerId: string
  unitId: string | null
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

export type StudyResultAnswer = {
  wordId: string
  spelling: string
  meaning: string
  phonetic: string | null
  emoji: string | null
  questionType: QuestionType
  submittedAnswer: string | null
  isCorrect: boolean
  correctAnswer: string
  progress: WordProgress | null
}

export type StudyResult = {
  session: StudySession
  wrongCount: number
  accuracy: number
  answers: StudyResultAnswer[]
}

export type ReviewWord = Word & {
  status: 'NEW' | 'LEARNING' | 'MASTERED'
  correctCount: number
  wrongCount: number
  lastSeenAt: string | null
  nextReviewAt: string
}

export type ReviewQueue = {
  total: number
  words: ReviewWord[]
}

export type DashboardWordBookProgress = {
  id: string
  name: string
  totalWordCount: number
  masteredWordCount: number
  completionPercent: number
}

export type Dashboard = {
  todayLearnedCount: number
  dailyGoal: number
  streakDays: number
  masteredWordCount: number
  reviewDueCount: number
  hasLearningHistory: boolean
  currentWordBook: DashboardWordBookProgress | null
}
