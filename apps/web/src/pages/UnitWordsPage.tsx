import { Alert, Breadcrumb, Button, Card, Empty, List, Spin, Tag, Typography } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { queryKeys } from '../api/queryKeys'

export function UnitWordsPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const query = useQuery({
    queryKey: queryKeys.unitWords(unitId ?? ''),
    queryFn: () => api.getUnitWords(unitId ?? ''),
    enabled: Boolean(unitId),
  })

  if (query.isPending) {
    return <Spin className="page-state" size="large" tip="正在加载单词…" />
  }

  if (query.isError || !unitId) {
    return (
      <Alert
        className="page-state page-state-error"
        type="error"
        showIcon
        message={!unitId ? '单元地址无效' : '单词加载失败'}
        description={query.error?.message}
        action={
          <Button>
            <Link to="/books">返回词书</Link>
          </Button>
        }
      />
    )
  }

  const result = query.data

  return (
    <div className="page-shell">
      <Breadcrumb
        className="page-breadcrumb"
        items={[{ title: <Link to="/books">词书</Link> }, { title: result.unit.name }]}
      />

      <div className="section-heading">
        <div>
          <Typography.Title level={2}>{result.unit.name}</Typography.Title>
          <Typography.Text type="secondary">共 {result.total} 个单词</Typography.Text>
        </div>
        <Button>
          <Link to="/books">返回词书</Link>
        </Button>
      </div>

      {result.words.length === 0 ? (
        <Empty description="这个单元还没有单词" />
      ) : (
        <List
          className="word-list"
          grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
          dataSource={result.words}
          renderItem={(word) => (
            <List.Item>
              <Card className="word-card">
                <div className="word-card-title">
                  <span className="word-emoji">{word.emoji ?? '📝'}</span>
                  <Typography.Title level={4}>{word.spelling}</Typography.Title>
                </div>
                <Typography.Text type="secondary">{word.phonetic ?? '暂无音标'}</Typography.Text>
                <Typography.Paragraph className="word-meaning">
                  {word.meaning}
                </Typography.Paragraph>
                {word.partOfSpeech && <Tag>{word.partOfSpeech}</Tag>}
                {word.example && (
                  <Typography.Paragraph className="word-example" type="secondary">
                    {word.example}
                    {word.exampleZh && <span>{word.exampleZh}</span>}
                  </Typography.Paragraph>
                )}
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  )
}
