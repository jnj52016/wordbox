import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api/client'
import { useLearner } from '../learner/useLearner'
import { LearnPage } from './LearnPage'

vi.mock('../api/client', () => ({
  api: {
    getUnitWords: vi.fn(),
    createStudySession: vi.fn(),
    submitProgressFeedback: vi.fn(),
  },
}))

vi.mock('../learner/useLearner', () => ({
  useLearner: vi.fn(),
}))

describe('LearnPage', () => {
  const mockedApi = vi.mocked(api)
  const mockedUseLearner = vi.mocked(useLearner)

  beforeEach(() => {
    mockedUseLearner.mockReturnValue({
      publicId: 'learner-1',
      data: {
        publicId: 'learner-1',
        dailyGoal: 10,
        autoPronounce: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      isPending: false,
      isError: false,
      error: null,
    } as never)
    mockedApi.getUnitWords.mockResolvedValue({
      unit: { id: 'unit-1', name: '日常基础', order: 1, wordCount: 2 },
      total: 2,
      words: [
        {
          id: 'word-1',
          spelling: 'hello',
          phonetic: '/həˈloʊ/',
          meaning: '你好；喂',
          partOfSpeech: 'interjection',
          example: 'Hello!',
          exampleZh: '你好！',
          imageUrl: null,
          emoji: '👋',
          order: 1,
        },
        {
          id: 'word-2',
          spelling: 'thanks',
          phonetic: '/θæŋks/',
          meaning: '谢谢',
          partOfSpeech: 'noun',
          example: 'Thanks a lot.',
          exampleZh: '非常感谢。',
          imageUrl: null,
          emoji: '🙏',
          order: 2,
        },
      ],
    })
    mockedApi.createStudySession.mockResolvedValue({
      id: 'session-1',
      learnerId: 'learner-1',
      unitId: 'unit-1',
      mode: 'LEARN',
      totalCount: 2,
      answeredCount: 0,
      correctCount: 0,
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: null,
    })
    mockedApi.submitProgressFeedback.mockResolvedValue({
      status: 'LEARNING',
      correctStreak: 0,
      correctCount: 0,
      wrongCount: 0,
      nextReviewAt: '2026-01-02T00:00:00.000Z',
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows cards, advances feedback, and creates a quiz session after the round', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          <MemoryRouter initialEntries={['/learn/unit-1']}>
            <Routes>
              <Route path="/learn/:unitId" element={<LearnPage />} />
            </Routes>
          </MemoryRouter>
        </ConfigProvider>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: 'hello' })).toBeInTheDocument()
    expect(screen.getByText('你好；喂')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '认识' }))
    expect(await screen.findByRole('heading', { name: 'thanks' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '认识' }))
    await waitFor(() => {
      expect(mockedApi.createStudySession).toHaveBeenCalledWith({
        learnerId: 'learner-1',
        unitId: 'unit-1',
        count: 2,
      })
    })
  })

  it('puts an unfamiliar word back at the end of the queue', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          <MemoryRouter initialEntries={['/learn/unit-1']}>
            <Routes>
              <Route path="/learn/:unitId" element={<LearnPage />} />
            </Routes>
          </MemoryRouter>
        </ConfigProvider>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: 'hello' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '不认识' }))
    expect(await screen.findByRole('heading', { name: 'thanks' })).toBeInTheDocument()
  })
})
