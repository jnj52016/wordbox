import { Card, Typography } from 'antd'
import { Link, Route, Routes } from 'react-router-dom'
import { BookDetailPage } from '../pages/BookDetailPage'
import { BooksPage } from '../pages/BooksPage'
import { HomePage } from '../pages/HomePage'
import { LearnPage } from '../pages/study/LearnPage'
import { QuizPage } from '../pages/study/QuizPage'
import { ResultPage } from '../pages/study/ResultPage'
import { ReviewPage } from '../pages/ReviewPage'
import { SettingsPage } from '../pages/SettingsPage'
import { UnitWordsPage } from '../pages/UnitWordsPage'

function NotFoundPage() {
  return (
    <Card>
      <Typography.Title level={3}>页面不存在</Typography.Title>
      <Link to="/">返回首页</Link>
    </Card>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/books/:bookId" element={<BookDetailPage />} />
      <Route path="/units/:unitId/words" element={<UnitWordsPage />} />
      <Route path="/learn/:unitId" element={<LearnPage />} />
      <Route path="/quiz/:sessionId" element={<QuizPage />} />
      <Route path="/result/:sessionId" element={<ResultPage />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
