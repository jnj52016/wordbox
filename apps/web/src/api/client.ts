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

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`)

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
}
