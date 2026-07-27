import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { BrowserRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((input: string) => {
        const isDashboardRequest = input.includes('/dashboard')
        return Promise.resolve({
          ok: true,
          json: async () =>
            isDashboardRequest
              ? {
                  todayLearnedCount: 0,
                  dailyGoal: 10,
                  streakDays: 0,
                  masteredWordCount: 0,
                  reviewDueCount: 0,
                  hasLearningHistory: false,
                  currentWordBook: null,
                }
              : {
                  publicId: 'test-learner',
                  dailyGoal: 10,
                  autoPronounce: true,
                  createdAt: '2026-01-01T00:00:00.000Z',
                  updatedAt: '2026-01-01T00:00:00.000Z',
                },
        })
      }),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the WordBox dashboard', async () => {
    const queryClient = new QueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <ConfigProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ConfigProvider>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('heading', { name: '今天也来学几个单词' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '开始今日学习' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: '首页' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: '复习' })).toHaveLength(2)
  })
})
