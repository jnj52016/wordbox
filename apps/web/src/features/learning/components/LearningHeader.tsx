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
        className="mb-5"
        items={[{ title: <Link to="/books">词书</Link> }, { title: unitName }]}
      />
      <div className="mt-0 mb-4 flex items-center justify-between gap-6 max-[480px]:items-start max-[480px]:flex-col">
        <div>
          <Typography.Title className="!mt-0 !mb-2" level={2}>
            学习单词
          </Typography.Title>
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
