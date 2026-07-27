import { Card, Layout, Typography } from 'antd'
import { Link, Route, Routes } from 'react-router-dom'
import { BookDetailPage } from './pages/BookDetailPage'
import { BooksPage } from './pages/BooksPage'
import { LearnPage } from './pages/LearnPage'
import { HomePage } from './pages/HomePage'
import { QuizPage } from './pages/QuizPage'
import { ResultPage } from './pages/ResultPage'
import { ReviewPage } from './pages/ReviewPage'
import { SettingsPage } from './pages/SettingsPage'
import { UnitWordsPage } from './pages/UnitWordsPage'
import { useLearner } from './learner/useLearner'

const { Content, Header } = Layout

function NotFoundPage() {
  return (
    <Card>
      <Typography.Title level={3}>页面不存在</Typography.Title>
      <Link to="/">返回首页</Link>
    </Card>
  )
}

export default function App() {
  const learnerQuery = useLearner()

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Link className="brand" to="/">
          WordBox
        </Link>
        <nav className="app-nav">
          <Link to="/books">词书</Link>
          <Link to="/review">复习</Link>
          <Link to="/settings">设置</Link>
        </nav>
        <span className="learner-status">
          {learnerQuery.isPending && '身份同步中'}
          {learnerQuery.isError && '身份同步失败'}
        </span>
      </Header>
      <Content className="app-content">
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
      </Content>
    </Layout>
  )
}
