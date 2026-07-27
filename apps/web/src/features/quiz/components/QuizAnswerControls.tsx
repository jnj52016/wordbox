import { Button, Input, Space } from 'antd'
import type { StudyAnswerResult, StudyQuestion } from '../../../api/types'

export function QuizAnswerControls({
  question,
  inputValue,
  answerResult,
  answerLocked,
  answerPending,
  onInputChange,
  onSubmit,
}: {
  question: StudyQuestion
  inputValue: string
  answerResult: StudyAnswerResult | null
  answerLocked: boolean
  answerPending: boolean
  onInputChange: (value: string) => void
  onSubmit: (answer: string) => void
}) {
  if (question.questionType === 'SPELLING') {
    return (
      <Space.Compact className="quiz-input">
        <Input
          value={inputValue}
          placeholder="输入英文拼写"
          disabled={answerLocked || answerPending}
          onChange={(event) => onInputChange(event.target.value)}
          onPressEnter={() => onSubmit(inputValue)}
        />
        <Button
          type="primary"
          loading={answerPending}
          disabled={answerLocked}
          onClick={() => onSubmit(inputValue)}
        >
          提交
        </Button>
      </Space.Compact>
    )
  }

  return (
    <div className="quiz-options">
      {question.options.map((option) => (
        <Button
          key={option}
          size="large"
          type={answerResult && option === answerResult.correctAnswer ? 'primary' : 'default'}
          danger={Boolean(answerResult && option !== answerResult.correctAnswer)}
          disabled={answerLocked || answerPending}
          loading={answerPending}
          onClick={() => onSubmit(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  )
}
