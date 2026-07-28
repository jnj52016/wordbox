import { Breadcrumb, Button, Progress, Typography } from 'antd'
import { Link } from 'react-router-dom'
import type { StudyMode } from '../../../api/types'

export function QuizHeader({
  mode,
  unitId,
  questionIndex,
  total,
}: {
  mode: StudyMode
  unitId: string | null
  questionIndex: number
  total: number
}) {
  const progressPercent = Math.round((questionIndex / total) * 100)
  const backTo = mode === 'REVIEW' ? '/review' : unitId ? `/learn/${unitId}` : '/books'

  return (
    <>
      <Breadcrumb
        className="mb-5"
        items={[{ title: <Link to="/books">词书</Link> }, { title: '测验' }]}
      />
      <div className="mt-0 mb-4 flex items-center justify-between gap-6 max-[480px]:items-start max-[480px]:flex-col">
        <div>
          <Typography.Title className="!mt-0 !mb-2" level={2}>
            单词测验
          </Typography.Title>
          <Typography.Text type="secondary">
            第 {questionIndex + 1} / {total} 题
          </Typography.Text>
        </div>
        <Button>
          <Link to={backTo}>返回学习</Link>
        </Button>
      </div>
      <Progress percent={progressPercent} showInfo={false} />
    </>
  )
}
