export const queryKeys = {
  wordBooks: ['word-books'] as const,
  wordBook: (id: string) => ['word-books', id] as const,
  unitWords: (id: string) => ['units', id, 'words'] as const,
}
