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
    return <Spin className="mx-auto my-20 block text-center" size="large" tip="正在加载词书…" />
  }

  if (query.isError) {
    return (
      <Alert
        className="mx-auto my-20 block max-w-[640px] text-left"
        type="error"
        showIcon
        message="词书加载失败"
        description={query.error.message}
        action={<Button onClick={() => void query.refetch()}>重试</Button>}
      />
    )
  }

  if (query.data.length === 0) {
    return <Empty className="mx-auto my-20 text-center" description="还没有可用词书" />
  }

  return (
    <div className="w-full max-w-[1080px]">
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title className="!mt-0 !mb-2" level={2}>
            词书
          </Typography.Title>
          <Typography.Paragraph className="!mb-0" type="secondary">
            选择一本词书，开始你的今日学习。
          </Typography.Paragraph>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        {query.data.map((book) => (
          <Col key={book.id} xs={24} sm={12} lg={8}>
            <Link className="block h-full text-inherit" to={`/books/${book.id}`}>
              <Card
                className="h-full"
                hoverable
                cover={
                  <div
                    className="grid h-[140px] place-items-center text-5xl font-bold text-white/90"
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
                <div className="flex flex-wrap items-center gap-2">
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
