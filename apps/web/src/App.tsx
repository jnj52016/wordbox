import { Card, Layout, Typography } from 'antd'
import { Link, NavLink, Route, Routes } from 'react-router-dom'
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

const { Content, Header, Sider } = Layout

const navigationItems = [
  { to: '/', label: '首页', end: true },
  { to: '/books', label: '词书' },
  { to: '/review', label: '复习' },
  { to: '/settings', label: '设置' },
]

function Navigation({ className = '' }: { className?: string }) {
  return (
    <nav className={className} aria-label="主导航">
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

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
      <Sider className="desktop-sidebar" width={224} theme="light">
        <Link className="brand sidebar-brand" to="/">
          WordBox
        </Link>
        <Navigation className="desktop-nav" />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Link className="brand mobile-brand" to="/">
            WordBox
          </Link>
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
      <Navigation className="mobile-nav" />
    </Layout>
  )
}
