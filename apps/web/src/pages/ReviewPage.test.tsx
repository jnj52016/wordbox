import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../api/client'
import { useLearner } from '../learner/useLearner'
import { ReviewPage } from './ReviewPage'

vi.mock('../api/client', () => ({
  api: {
    getReviewQueue: vi.fn(),
    getStudyResult: vi.fn(),
    createStudySession: vi.fn(),
    markProgressMastered: vi.fn(),
  },
}))

vi.mock('../learner/useLearner', () => ({
  useLearner: vi.fn(),
}))

describe('ReviewPage', () => {
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
    mockedApi.getReviewQueue.mockResolvedValue({
      total: 1,
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
          status: 'LEARNING',
          correctCount: 0,
          wrongCount: 1,
          lastSeenAt: '2026-01-01T00:00:00.000Z',
          nextReviewAt: '2026-01-02T00:00:00.000Z',
        },
      ],
    })
    mockedApi.getStudyResult.mockResolvedValue({
      session: {
        id: 'session-1',
        learnerId: 'learner-1',
        unitId: 'unit-1',
        mode: 'LEARN',
        totalCount: 1,
        answeredCount: 1,
        correctCount: 0,
        startedAt: '2026-01-01T00:00:00.000Z',
        completedAt: '2026-01-01T00:01:00.000Z',
      },
      wrongCount: 1,
      accuracy: 0,
      answers: [
        {
          wordId: 'word-2',
          spelling: 'thanks',
          meaning: '谢谢',
          phonetic: '/θæŋks/',
          emoji: '🙏',
          questionType: 'ZH_TO_EN',
          submittedAnswer: 'thank',
          isCorrect: false,
          correctAnswer: 'thanks',
          progress: {
            status: 'LEARNING',
            correctStreak: 0,
            correctCount: 0,
            wrongCount: 1,
            nextReviewAt: '2026-01-02T00:00:00.000Z',
          },
        },
      ],
    })
    mockedApi.createStudySession.mockResolvedValue({
      id: 'review-session-1',
      learnerId: 'learner-1',
      unitId: null,
      mode: 'REVIEW',
      totalCount: 1,
      answeredCount: 0,
      correctCount: 0,
      startedAt: '2026-01-01T00:00:00.000Z',
      completedAt: null,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  function renderPage(initialEntry = '/review') {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route path="/review" element={<ReviewPage />} />
            </Routes>
          </MemoryRouter>
        </ConfigProvider>
      </QueryClientProvider>,
    )
  }

  it('renders the normal review queue without a source session', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: '错词复习' })).toBeInTheDocument()
    expect(screen.getByText('hello')).toBeInTheDocument()
    expect(mockedApi.getStudyResult).not.toHaveBeenCalled()
  })

  it('prioritizes wrong answers from the source session', async () => {
    mockedApi.getReviewQueue.mockResolvedValue({ total: 0, words: [] })
    renderPage('/review?sourceSessionId=session-1')

    expect(await screen.findByText('本轮有 1 个错词，已优先安排复习')).toBeInTheDocument()
    expect(screen.getByText('thanks')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '开始专项复习' }))

    await waitFor(() => {
      expect(mockedApi.createStudySession).toHaveBeenCalledWith({
        learnerId: 'learner-1',
        mode: 'REVIEW',
        count: 10,
        sourceSessionId: 'session-1',
      })
    })
  })
})
