import { Alert, Button, Card, Typography } from 'antd'
import type { StudyAnswerResult, StudyQuestion } from '../../../api/types'
import { QuizAnswerControls } from './QuizAnswerControls'
import { QuizFeedback } from './QuizFeedback'

export function QuizQuestionCard({
  question,
  inputValue,
  answerResult,
  answerError,
  answerPending,
  completing,
  isLastQuestion,
  onInputChange,
  onSubmit,
  onNext,
  onResetError,
}: {
  question: StudyQuestion
  inputValue: string
  answerResult: StudyAnswerResult | null
  answerError?: Error | null
  answerPending: boolean
  completing: boolean
  isLastQuestion: boolean
  onInputChange: (value: string) => void
  onSubmit: (answer: string) => void
  onNext: () => void
  onResetError: () => void
}) {
  return (
    <Card className="mt-6 p-7 text-center max-[480px]:px-4 max-[480px]:py-5">
      <Typography.Text type="secondary">
        {question.questionType === 'EN_TO_ZH'
          ? '看英文选中文'
          : question.questionType === 'ZH_TO_EN'
            ? '看中文选英文'
            : '英文拼写'}
      </Typography.Text>
      <div className="my-7">
        {question.emoji && <span className="text-3xl">{question.emoji}</span>}
        <Typography.Title className="!my-2" level={1}>
          {question.prompt}
        </Typography.Title>
        {question.phonetic && (
          <Typography.Text type="secondary">{question.phonetic}</Typography.Text>
        )}
      </div>

      <QuizAnswerControls
        question={question}
        inputValue={inputValue}
        answerResult={answerResult}
        answerLocked={Boolean(answerResult)}
        answerPending={answerPending}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
      />

      {answerError && (
        <Alert
          className="mt-6 text-left"
          type="error"
          showIcon
          message="提交失败"
          description={answerError.message}
          action={<Button onClick={onResetError}>重试</Button>}
        />
      )}

      {answerResult && (
        <QuizFeedback
          result={answerResult}
          isLastQuestion={isLastQuestion}
          completing={completing}
          onNext={onNext}
        />
      )}
    </Card>
  )
}
