export const queryKeys = {
  learner: (publicId: string) => ['learners', publicId] as const,
  wordBooks: ['word-books'] as const,
  wordBook: (id: string) => ['word-books', id] as const,
  unitWords: (id: string) => ['units', id, 'words'] as const,
  studySession: (id: string) => ['study-sessions', id] as const,
  studyResult: (id: string) => ['study-sessions', id, 'result'] as const,
  studyQuestions: (id: string) => ['study-sessions', id, 'questions'] as const,
}
