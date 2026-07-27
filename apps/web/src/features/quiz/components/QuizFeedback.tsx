import { Alert, Button } from 'antd'
import type { StudyAnswerResult } from '../../../api/types'

export function QuizFeedback({
  result,
  isLastQuestion,
  completing,
  onNext,
}: {
  result: StudyAnswerResult
  isLastQuestion: boolean
  completing: boolean
  onNext: () => void
}) {
  return (
    <Alert
      className="quiz-feedback"
      type={result.isCorrect ? 'success' : 'error'}
      showIcon
      message={result.isCorrect ? '回答正确' : '回答错误'}
      description={result.isCorrect ? undefined : `正确答案：${result.correctAnswer}`}
      action={
        <Button type="primary" loading={completing} onClick={onNext}>
          {isLastQuestion ? '完成测验' : '下一题'}
        </Button>
      }
    />
  )
}
