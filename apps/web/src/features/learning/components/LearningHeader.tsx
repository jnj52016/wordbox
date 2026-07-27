import { Breadcrumb, Button, Progress, Typography } from 'antd'
import { Link } from 'react-router-dom'

export function LearningHeader({
  unitId,
  unitName,
  completedCount,
  total,
}: {
  unitId: string
  unitName: string
  completedCount: number
  total: number
}) {
  const progressPercent = Math.round((completedCount / total) * 100)

  return (
    <>
      <Breadcrumb
        className="page-breadcrumb"
        items={[{ title: <Link to="/books">词书</Link> }, { title: unitName }]}
      />
      <div className="section-heading learning-heading">
        <div>
          <Typography.Title level={2}>学习单词</Typography.Title>
          <Typography.Text type="secondary">
            第 {Math.min(completedCount + 1, total)} / {total} 个
          </Typography.Text>
        </div>
        <Button>
          <Link to={`/units/${unitId}/words`}>返回单词列表</Link>
        </Button>
      </div>
      <Progress percent={progressPercent} showInfo={false} />
    </>
  )
}
