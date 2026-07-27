import { useQuery } from '@tanstack/react-query'
import { Alert, Breadcrumb, Button, Card, List, Space, Statistic, Tag, Typography } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../api/client'
import { queryKeys } from '../../api/queryKeys'

export function ResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const resultQuery = useQuery({
    queryKey: queryKeys.studyResult(sessionId ?? ''),
    queryFn: () => api.getStudyResult(sessionId ?? ''),
    enabled: Boolean(sessionId),
  })

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
  const wrongAnswers = result.answers.filter((answer) => !answer.isCorrect)

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
          <Button type="primary">
            <Link
              to={
                result.session.mode === 'REVIEW'
                  ? '/review'
                  : `/learn/${result.session.unitId}`
              }
            >
              {result.session.mode === 'REVIEW' ? '继续复习' : '继续学习'}
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

      <Card title="本次答题明细" className="result-answer-card">
        {wrongAnswers.length === 0 ? (
          <Alert type="success" showIcon message="太棒了，本次没有错词" />
        ) : (
          <List
            dataSource={wrongAnswers}
            renderItem={(answer) => (
              <List.Item>
                <List.Item.Meta
                  avatar={answer.emoji}
                  title={
                    <Space>
                      <span>{answer.spelling}</span>
                      {answer.phonetic && (
                        <Typography.Text type="secondary">{answer.phonetic}</Typography.Text>
                      )}
                    </Space>
                  }
                  description={answer.meaning}
                />
                <Space direction="vertical" align="end">
                  <Tag>你的答案：{answer.submittedAnswer || '未填写'}</Tag>
                  <Tag color="green">正确答案：{answer.correctAnswer}</Tag>
                </Space>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}
