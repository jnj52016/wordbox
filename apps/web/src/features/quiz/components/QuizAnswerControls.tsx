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
      <Space.Compact className="w-full max-w-[560px]">
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
    <div className="mx-auto grid w-full max-w-[560px] grid-cols-2 gap-3 max-[480px]:grid-cols-1">
      {question.options.map((option) => (
        <Button
          key={option}
          className="h-auto min-h-[52px] whitespace-normal"
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
