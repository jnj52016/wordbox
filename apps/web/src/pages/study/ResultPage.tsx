import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Empty,
  List,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import { queryKeys } from '../../api/queryKeys'
import type { StudyResultAnswer } from '../../api/types'

function ResultWordList({
  answers,
  emptyDescription,
  showAnswer = false,
}: {
  answers: StudyResultAnswer[]
  emptyDescription: string
  showAnswer?: boolean
}) {
  if (answers.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyDescription} />
  }

  return (
    <List
      size="small"
      dataSource={answers}
      renderItem={(answer) => (
        <List.Item>
          <List.Item.Meta
            avatar={<span className="result-word-emoji">{answer.emoji ?? '📝'}</span>}
            title={
              <Space wrap>
                <span>{answer.spelling}</span>
                {answer.phonetic && (
                  <Typography.Text type="secondary">{answer.phonetic}</Typography.Text>
                )}
              </Space>
            }
            description={answer.meaning}
          />
          {showAnswer && (
            <Space direction="vertical" align="end">
              <Tag>你的答案：{answer.submittedAnswer || '未填写'}</Tag>
              <Tag color="green">正确答案：{answer.correctAnswer}</Tag>
            </Space>
          )}
        </List.Item>
      )}
    />
  )
}

export function ResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const queryClient = useQueryClient()
  const resultQuery = useQuery({
    queryKey: queryKeys.studyResult(sessionId ?? ''),
    queryFn: () => api.getStudyResult(sessionId ?? ''),
    enabled: Boolean(sessionId),
  })
  const unitId = resultQuery.data?.session.unitId ?? ''
  const unitQuery = useQuery({
    queryKey: queryKeys.unit(unitId),
    queryFn: () => api.getUnit(unitId),
    enabled: Boolean(unitId && resultQuery.data),
  })

  useEffect(() => {
    const learnerId = resultQuery.data?.session.learnerId
    if (!learnerId) {
      return
    }

    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(learnerId) })
    void queryClient.invalidateQueries({ queryKey: queryKeys.reviewQueue(learnerId) })
  }, [queryClient, resultQuery.data])

  if (resultQuery.isPending) {
    return <div className="page-state">正在加载学习结果…</div>
  }

  if (!sessionId || resultQuery.isError) {
    return (
      <Alert
        className="page-state page-state-error"
        type="error"
        showIcon
        message={!sessionId ? '结果地址无效' : '学习结果加载失败'}
        description={resultQuery.error?.message}
        action={
          <Button>
            <Link to="/books">返回词书</Link>
          </Button>
        }
      />
    )
  }

  const result = resultQuery.data
  const masteredAnswers = result.answers.filter(
    (answer) => answer.isCorrect && answer.progress?.status === 'MASTERED',
  )
  const familiarAnswers = result.answers.filter(
    (answer) => answer.isCorrect && answer.progress?.status !== 'MASTERED',
  )
  const wrongAnswers = result.answers.filter((answer) => !answer.isCorrect)
  const nextUnitId = unitQuery.data?.nextUnitId
  const nextUnitPending = result.session.mode === 'LEARN' && unitQuery.isPending

  return (
    <div className="page-shell result-shell">
      <Breadcrumb
        className="page-breadcrumb"
        items={[{ title: <Link to="/books">词书</Link> }, { title: '学习结果' }]}
      />

      <div className="section-heading">
        <div>
          <Typography.Title level={2}>学习结果</Typography.Title>
          <Typography.Text type="secondary">
            本次完成 {result.session.totalCount} 个单词
          </Typography.Text>
        </div>
        <Space wrap>
          {result.wrongCount > 0 && (
            <Button>
              <Link to="/review">复习错词</Link>
            </Button>
          )}
          <Button type="primary" disabled={nextUnitPending}>
            <Link
              to={
                result.session.mode === 'REVIEW'
                  ? '/review'
                  : nextUnitId
                    ? `/learn/${nextUnitId}`
                    : `/learn/${result.session.unitId}`
              }
            >
              {result.session.mode === 'REVIEW'
                ? '继续复习'
                : nextUnitPending
                  ? '正在查找下一单元…'
                  : nextUnitId
                    ? '继续下一单元'
                    : '再学一轮'}
            </Link>
          </Button>
          <Button>
            <Link to="/">返回首页</Link>
          </Button>
        </Space>
      </div>

      <div className="result-stat-grid">
        <Card>
          <Statistic
            title="答对"
            value={result.session.correctCount}
            suffix={` / ${result.session.totalCount}`}
          />
        </Card>
        <Card>
          <Statistic title="答错" value={result.wrongCount} />
        </Card>
        <Card>
          <Statistic title="正确率" value={result.accuracy} suffix="%" />
        </Card>
      </div>

      <div className="result-category-grid">
        <Card
          title={
            <Space>
              <span>已掌握</span>
              <Tag color="green">{masteredAnswers.length}</Tag>
            </Space>
          }
        >
          <ResultWordList answers={masteredAnswers} emptyDescription="本轮还没有新掌握的单词" />
        </Card>
        <Card
          title={
            <Space>
              <span>学习中 / 模糊</span>
              <Tag color="blue">{familiarAnswers.length}</Tag>
            </Space>
          }
        >
          <ResultWordList answers={familiarAnswers} emptyDescription="本轮没有学习中的单词" />
        </Card>
        <Card
          title={
            <Space>
              <span>错误单词</span>
              <Tag color="red">{wrongAnswers.length}</Tag>
            </Space>
          }
        >
          {wrongAnswers.length === 0 ? (
            <Alert type="success" showIcon message="太棒了，本次没有错词" />
          ) : (
            <ResultWordList answers={wrongAnswers} emptyDescription="本轮没有错词" showAnswer />
          )}
        </Card>
      </div>
    </div>
  )
}
