import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Card, Empty, List, Space, Spin, Tag, Typography } from 'antd'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { queryKeys } from '../api/queryKeys'
import type { ReviewWord, StudyResultAnswer } from '../api/types'
import { useLearner } from '../learner/useLearner'

function getSourceReviewWords(answers: StudyResultAnswer[]): ReviewWord[] {
  return answers.flatMap((answer) => {
    const progress = answer.progress
    if (answer.isCorrect || !progress?.nextReviewAt) {
      return []
    }

    return [
      {
        id: answer.wordId,
        spelling: answer.spelling,
        phonetic: answer.phonetic,
        meaning: answer.meaning,
        partOfSpeech: null,
        example: null,
        exampleZh: null,
        imageUrl: null,
        emoji: answer.emoji,
        order: 0,
        status: progress.status,
        correctCount: progress.correctCount,
        wrongCount: progress.wrongCount,
        lastSeenAt: null,
        nextReviewAt: progress.nextReviewAt,
      },
    ]
  })
}

function useReviewResult(sessionId: string) {
  return useQuery({
    queryKey: queryKeys.studyResult(sessionId),
    queryFn: () => api.getStudyResult(sessionId),
    enabled: Boolean(sessionId),
  })
}

export function ReviewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const sourceSessionId = searchParams.get('sourceSessionId') ?? ''
  const learnerQuery = useLearner()
  const learnerId = learnerQuery.data?.publicId ?? ''
  const queueQuery = useQuery({
    queryKey: queryKeys.reviewQueue(learnerId),
    queryFn: () => api.getReviewQueue(learnerId),
    enabled: Boolean(learnerId),
  })
  const sourceResultQuery = useReviewResult(sourceSessionId)
  const startMutation = useMutation({
    mutationFn: () =>
      api.createStudySession({
        learnerId,
        mode: 'REVIEW',
        count: 10,
        ...(sourceSessionId ? { sourceSessionId } : {}),
      }),
    onSuccess: (session) => navigate(`/quiz/${session.id}`),
  })
  const masteredMutation = useMutation({
    mutationFn: api.markProgressMastered,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reviewQueue(learnerId) })
      if (sourceSessionId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.studyResult(sourceSessionId) })
      }
    },
  })

  if (learnerQuery.isError || queueQuery.isError || sourceResultQuery.isError) {
    return (
      <Alert
        className="page-state page-state-error"
        type="error"
        showIcon
        message="复习内容加载失败"
        description={
          learnerQuery.error?.message ??
          queueQuery.error?.message ??
          sourceResultQuery.error?.message
        }
        action={
          <Button>
            <Link to="/">返回首页</Link>
          </Button>
        }
      />
    )
  }

  if (
    learnerQuery.isPending ||
    queueQuery.isPending ||
    (Boolean(sourceSessionId) && sourceResultQuery.isPending)
  ) {
    return <Spin className="page-state" size="large" tip="正在加载复习内容…" />
  }

  const queue = queueQuery.data
  const sourceWords = sourceResultQuery.data
    ? getSourceReviewWords(sourceResultQuery.data.answers)
    : []
  const sourceWordIds = new Set(sourceWords.map((word) => word.id))
  const words = [...sourceWords, ...queue.words.filter((word) => !sourceWordIds.has(word.id))]
  const hasSourceWords = sourceWords.length > 0

  return (
    <div className="page-shell review-shell">
      <div className="section-heading">
        <div>
          <Typography.Title level={2}>错词复习</Typography.Title>
          <Typography.Text type="secondary">
            {hasSourceWords
              ? `本轮有 ${sourceWords.length} 个错词，已优先安排复习`
              : `当前有 ${words.length} 个单词需要复习`}
          </Typography.Text>
        </div>
        <Button
          type="primary"
          disabled={words.length === 0}
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

      {words.length === 0 ? (
        <Card>
          <Empty description="今天没有需要复习的单词" />
        </Card>
      ) : (
        <List
          className="review-list"
          grid={{ gutter: 16, xs: 1, sm: 2, lg: 3 }}
          dataSource={words}
          renderItem={(word) => (
            <List.Item>
              <Card className="review-word-card">
                <div className="word-card-title">
                  <span className="word-emoji">{word.emoji ?? '📝'}</span>
                  <Typography.Title level={4}>{word.spelling}</Typography.Title>
                </div>
                <Typography.Text type="secondary">{word.phonetic ?? '暂无音标'}</Typography.Text>
                <Typography.Paragraph className="word-meaning">{word.meaning}</Typography.Paragraph>
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
                  onClick={() => masteredMutation.mutate({ learnerId, wordId: word.id })}
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
