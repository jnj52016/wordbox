import { Alert, Button, Card, Col, Empty, Row, Spin, Tag, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { queryKeys } from '../api/queryKeys'

export function BooksPage() {
  const query = useQuery({
    queryKey: queryKeys.wordBooks,
    queryFn: api.listWordBooks,
  })

  if (query.isPending) {
    return <Spin className="page-state" size="large" tip="正在加载词书…" />
  }

  if (query.isError) {
    return (
      <Alert
        className="page-state page-state-error"
        type="error"
        showIcon
        message="词书加载失败"
        description={query.error.message}
        action={<Button onClick={() => void query.refetch()}>重试</Button>}
      />
    )
  }

  if (query.data.length === 0) {
    return <Empty className="page-state" description="还没有可用词书" />
  }

  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <Typography.Title level={2}>词书</Typography.Title>
          <Typography.Paragraph type="secondary">
            选择一本词书，开始你的今日学习。
          </Typography.Paragraph>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {query.data.map((book) => (
          <Col key={book.id} xs={24} sm={12} lg={8}>
            <Link className="card-link" to={`/books/${book.id}`}>
              <Card
                className="book-card"
                hoverable
                cover={
                  <div
                    className="book-cover"
                    style={{ backgroundColor: book.coverColor ?? '#2563eb' }}
                  >
                    <span>{book.name.slice(0, 1)}</span>
                  </div>
                }
              >
                <Typography.Title level={4}>{book.name}</Typography.Title>
                <Typography.Paragraph ellipsis={{ rows: 2 }} type="secondary">
                  {book.description ?? '开始一段新的单词学习。'}
                </Typography.Paragraph>
                <div className="book-meta">
                  <Tag color="blue">{book.level ?? '未分级'}</Tag>
                  <Typography.Text type="secondary">
                    {book.unitCount} 个单元 · {book.wordCount} 个单词
                  </Typography.Text>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  )
}
