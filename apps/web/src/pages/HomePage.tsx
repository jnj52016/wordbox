import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Card, Progress, Space, Spin, Statistic, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { queryKeys } from '../api/queryKeys'
import { useLearner } from '../learner/useLearner'

export function HomePage() {
  const learnerQuery = useLearner()
  const learnerId = learnerQuery.data?.publicId ?? ''
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard(learnerId),
    queryFn: () => api.getDashboard(learnerId),
    enabled: Boolean(learnerId),
  })

  if (learnerQuery.isError || dashboardQuery.isError) {
    return (
      <Alert
        className="page-state page-state-error"
        type="error"
        showIcon
        message="首页数据加载失败"
        description={learnerQuery.error?.message ?? dashboardQuery.error?.message}
        action={
          <Button>
            <Link to="/books">去词书</Link>
          </Button>
        }
      />
    )
  }

  if (learnerQuery.isPending || dashboardQuery.isPending) {
    return <Spin className="page-state" size="large" tip="正在加载首页…" />
  }

  const dashboard = dashboardQuery.data
  const goalPercent =
    dashboard.dailyGoal === 0
      ? 0
      : Math.min(100, Math.round((dashboard.todayLearnedCount / dashboard.dailyGoal) * 100))

  return (
    <div className="page-shell dashboard-shell">
      <div className="dashboard-hero">
        <div>
          <Typography.Text type="secondary">WordBox</Typography.Text>
          <Typography.Title level={1}>今天也来学几个单词</Typography.Title>
          <Typography.Paragraph type="secondary">
            {dashboard.reviewDueCount > 0
              ? `有 ${dashboard.reviewDueCount} 个单词等待复习，先巩固再学习。`
              : '保持节奏，持续积累你的词汇量。'}
          </Typography.Paragraph>
        </div>
        <Space wrap>
          {dashboard.reviewDueCount > 0 && (
            <Button type="primary" size="large">
              <Link to="/review">开始复习</Link>
            </Button>
          )}
          <Button size="large">
            <Link to="/books">开始今日学习</Link>
          </Button>
        </Space>
      </div>

      {!dashboard.hasLearningHistory && (
        <Alert
          className="dashboard-onboarding"
          type="info"
          showIcon
          message="欢迎开始第一次学习"
          description="选择一本词书，完成一轮学习和测验后，这里会记录你的每日进度。"
        />
      )}

      <div className="dashboard-stat-grid">
        <Card>
          <Statistic title="今日已学习" value={dashboard.todayLearnedCount} suffix="词" />
        </Card>
        <Card>
          <Statistic title="连续学习" value={dashboard.streakDays} suffix="天" />
        </Card>
        <Card>
          <Statistic title="已掌握" value={dashboard.masteredWordCount} suffix="词" />
        </Card>
        <Card>
          <Statistic title="待复习" value={dashboard.reviewDueCount} suffix="词" />
        </Card>
      </div>

      <Card title={`每日目标：${dashboard.dailyGoal} 词`} className="dashboard-goal-card">
        <Progress percent={goalPercent} />
        <Typography.Text type="secondary">
          今天完成 {dashboard.todayLearnedCount} / {dashboard.dailyGoal} 词
        </Typography.Text>
      </Card>

      <Card title="当前词书进度" className="dashboard-book-card">
        {dashboard.currentWordBook ? (
          <>
            <div className="dashboard-book-heading">
              <Typography.Title level={4}>{dashboard.currentWordBook.name}</Typography.Title>
              <Typography.Text type="secondary">
                {dashboard.currentWordBook.masteredWordCount} /{' '}
                {dashboard.currentWordBook.totalWordCount} 词已掌握
              </Typography.Text>
            </div>
            <Progress percent={dashboard.currentWordBook.completionPercent} />
          </>
        ) : (
          <Typography.Text type="secondary">暂时没有可用词书</Typography.Text>
        )}
      </Card>
    </div>
  )
}
