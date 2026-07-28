import { Alert, Breadcrumb, Button, Card, Empty, List, Space, Spin, Tag, Typography } from 'antd'
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
    return <Spin className="mx-auto my-20 block text-center" size="large" tip="正在加载单词…" />
  }

  if (query.isError || !unitId) {
    return (
      <Alert
        className="mx-auto my-20 block max-w-[640px] text-left"
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
    <div className="w-full max-w-[1080px]">
      <Breadcrumb
        className="mb-5"
        items={[{ title: <Link to="/books">词书</Link> }, { title: result.unit.name }]}
      />

      <div className="my-8 flex items-center justify-between gap-6 max-[480px]:items-start max-[480px]:flex-col">
        <div>
          <Typography.Title className="!mt-0 !mb-2" level={2}>
            {result.unit.name}
          </Typography.Title>
          <Typography.Text type="secondary">共 {result.total} 个单词</Typography.Text>
        </div>
        <Space>
          <Button type="primary">
            <Link to={`/learn/${unitId}`}>开始学习</Link>
          </Button>
          <Button>
            <Link to="/books">返回词书</Link>
          </Button>
        </Space>
      </div>

      {result.words.length === 0 ? (
        <Empty description="这个单元还没有单词" />
      ) : (
        <List
          className="mt-5"
          grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
          dataSource={result.words}
          renderItem={(word) => (
            <List.Item>
              <Card className="h-full">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{word.emoji ?? '📝'}</span>
                  <Typography.Title className="!my-0" level={4}>
                    {word.spelling}
                  </Typography.Title>
                </div>
                <Typography.Text type="secondary">{word.phonetic ?? '暂无音标'}</Typography.Text>
                <Typography.Paragraph className="my-3 mb-2 text-base">
                  {word.meaning}
                </Typography.Paragraph>
                {word.partOfSpeech && <Tag>{word.partOfSpeech}</Tag>}
                {word.example && (
                  <Typography.Paragraph className="mt-4" type="secondary">
                    {word.example}
                    {word.exampleZh && <span className="mt-1 block">{word.exampleZh}</span>}
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
