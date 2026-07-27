import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Empty, List, Space, Spin, Tag, Typography } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { queryKeys } from '../api/queryKeys'
import { useLearner } from '../learner/useLearner'

export function ReviewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const learnerQuery = useLearner()
  const learnerId = learnerQuery.data?.publicId ?? ''
  const queueQuery = useQuery({
    queryKey: queryKeys.reviewQueue(learnerId),
    queryFn: () => api.getReviewQueue(learnerId),
    enabled: Boolean(learnerId),
  })
  const startMutation = useMutation({
    mutationFn: () =>
      api.createStudySession({
        learnerId,
        mode: 'REVIEW',
        count: 10,
      }),
    onSuccess: (session) => navigate(`/quiz/${session.id}`),
  })
  const masteredMutation = useMutation({
    mutationFn: api.markProgressMastered,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviewQueue(learnerId) })
    },
  })

  if (learnerQuery.isError || queueQuery.isError) {
    return (
      <Alert
        className="page-state page-state-error"
        type="error"
        showIcon
        message="复习内容加载失败"
        description={learnerQuery.error?.message ?? queueQuery.error?.message}
        action={
          <Button>
            <Link to="/">返回首页</Link>
          </Button>
        }
      />
    )
  }

  if (learnerQuery.isPending || queueQuery.isPending) {
    return <Spin className="page-state" size="large" tip="正在加载复习内容…" />
  }

  const queue = queueQuery.data

  return (
    <div className="page-shell review-shell">
      <div className="section-heading">
        <div>
          <Typography.Title level={2}>错词复习</Typography.Title>
          <Typography.Text type="secondary">
            当前有 {queue.total} 个单词需要复习
          </Typography.Text>
        </div>
        <Button
          type="primary"
          disabled={queue.total === 0}
          loading={startMutation.isPending}
          onClick={() => startMutation.mutate()}
        >
          开始专项复习
        </Button>
      </div>

      {startMutation.isError && (
        <Alert
          className="review-feedback"
          type="error"
          showIcon
          message="复习 Session 创建失败"
          description={startMutation.error.message}
          action={<Button onClick={() => startMutation.reset()}>关闭</Button>}
        />
      )}

      {masteredMutation.isError && (
        <Alert
          className="review-feedback"
          type="error"
          showIcon
          message="标记掌握失败"
          description={masteredMutation.error.message}
          action={<Button onClick={() => masteredMutation.reset()}>关闭</Button>}
        />
      )}

      {queue.words.length === 0 ? (
        <Card>
          <Empty description="今天没有需要复习的单词" />
        </Card>
      ) : (
        <List
          className="review-list"
          grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
          dataSource={queue.words}
          renderItem={(word) => (
            <List.Item>
              <Card className="review-word-card">
                <div className="word-card-title">
                  <span className="word-emoji">{word.emoji ?? '📝'}</span>
                  <Typography.Title level={4}>{word.spelling}</Typography.Title>
                </div>
                <Typography.Text type="secondary">
                  {word.phonetic ?? '暂无音标'}
                </Typography.Text>
                <Typography.Paragraph className="word-meaning">
                  {word.meaning}
                </Typography.Paragraph>
                <Space wrap>
                  <Tag color="red">错误 {word.wrongCount} 次</Tag>
                  <Tag>{word.status === 'MASTERED' ? '已掌握' : '学习中'}</Tag>
                </Space>
                <Typography.Paragraph type="secondary" className="review-time">
                  下次复习：{new Date(word.nextReviewAt).toLocaleString()}
                </Typography.Paragraph>
                <Button
                  size="small"
                  disabled={masteredMutation.isPending}
                  onClick={() =>
                    masteredMutation.mutate({ learnerId, wordId: word.id })
                  }
                >
                  标记为已掌握
                </Button>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  )
}
