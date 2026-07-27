import { Alert, Breadcrumb, Button, Card, Empty, List, Spin, Tag, Typography } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { queryKeys } from '../api/queryKeys'

export function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>()
  const query = useQuery({
    queryKey: queryKeys.wordBook(bookId ?? ''),
    queryFn: () => api.getWordBook(bookId ?? ''),
    enabled: Boolean(bookId),
  })

  if (query.isPending) {
    return <Spin className="page-state" size="large" tip="正在加载词书…" />
  }

  if (query.isError || !bookId) {
    return (
      <Alert
        className="page-state page-state-error"
        type="error"
        showIcon
        message={!bookId ? '词书地址无效' : '词书加载失败'}
        description={query.error?.message}
        action={
          <Button>
            <Link to="/books">返回词书</Link>
          </Button>
        }
      />
    )
  }

  const book = query.data

  return (
    <div className="page-shell">
      <Breadcrumb
        className="page-breadcrumb"
        items={[{ title: <Link to="/books">词书</Link> }, { title: book.name }]}
      />

      <Card className="book-detail-card">
        <div className="detail-intro">
          <div
            className="book-cover book-cover-small"
            style={{ backgroundColor: book.coverColor ?? '#2563eb' }}
          >
            <span>{book.name.slice(0, 1)}</span>
          </div>
          <div>
            <Typography.Title level={2}>{book.name}</Typography.Title>
            <Typography.Paragraph type="secondary">
              {book.description ?? '开始一段新的单词学习。'}
            </Typography.Paragraph>
            <div className="book-meta">
              <Tag color="blue">{book.level ?? '未分级'}</Tag>
              <Typography.Text type="secondary">
                {book.unitCount} 个单元 · {book.wordCount} 个单词
              </Typography.Text>
            </div>
          </div>
        </div>
      </Card>

      <div className="section-heading">
        <Typography.Title level={3}>单元</Typography.Title>
        <Typography.Text type="secondary">选择单元查看单词</Typography.Text>
      </div>

      {book.units.length === 0 ? (
        <Empty description="这个词书还没有单元" />
      ) : (
        <List
          className="unit-list"
          dataSource={book.units}
          renderItem={(unit) => (
            <List.Item
              actions={[
                <Button key="learn" type="primary">
                  <Link to={`/learn/${unit.id}`}>开始学习</Link>
                </Button>,
                <Button key="view" type="link">
                  <Link to={`/units/${unit.id}/words`}>查看单词</Link>
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<div className="unit-number">{unit.order}</div>}
                title={unit.name}
                description={`${unit.wordCount} 个单词`}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )
}
