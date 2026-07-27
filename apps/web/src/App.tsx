import { Button, Card, Layout, Typography } from 'antd'
import { Link, Route, Routes } from 'react-router-dom'
import { BookDetailPage } from './pages/BookDetailPage'
import { BooksPage } from './pages/BooksPage'
import { UnitWordsPage } from './pages/UnitWordsPage'

const { Content, Header } = Layout

function HomePage() {
  return (
    <Card className="welcome-card">
      <Typography.Title level={1}>WordBox</Typography.Title>
      <Typography.Paragraph>
        轻量、专注的单词学习工具。工程骨架已准备好，接下来将加入词书和学习流程。
      </Typography.Paragraph>
      <Button type="primary" size="large">
        <Link to="/books">开始学习</Link>
      </Button>
    </Card>
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
  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Link className="brand" to="/">
          WordBox
        </Link>
        <nav className="app-nav">
          <Link to="/books">词书</Link>
        </nav>
      </Header>
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:bookId" element={<BookDetailPage />} />
          <Route path="/units/:unitId/words" element={<UnitWordsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Content>
    </Layout>
  )
}
