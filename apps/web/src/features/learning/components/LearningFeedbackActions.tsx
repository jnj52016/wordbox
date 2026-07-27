import { Alert, Button, Space, Typography } from 'antd'
import type { LearningFeedback } from '../model/learningQueue'

export function LearningFeedbackActions({
  disabled,
  error,
  onResetError,
  onFeedback,
}: {
  disabled: boolean
  error?: Error | null
  onResetError: () => void
  onFeedback: (feedback: LearningFeedback) => void
}) {
  return (
    <>
      <Typography.Paragraph className="learning-prompt" type="secondary">
        你对这个单词的熟悉程度如何？
      </Typography.Paragraph>
      <Space className="learning-actions" wrap>
        <Button
          autoInsertSpace={false}
          danger
          size="large"
          disabled={disabled}
          onClick={() => onFeedback('unknown')}
        >
          不认识
        </Button>
        <Button
          autoInsertSpace={false}
          size="large"
          disabled={disabled}
          onClick={() => onFeedback('familiar')}
        >
          有印象
        </Button>
        <Button
          autoInsertSpace={false}
          type="primary"
          size="large"
          disabled={disabled}
          onClick={() => onFeedback('known')}
        >
          认识
        </Button>
      </Space>
      {error && (
        <Alert
          className="quiz-feedback"
          type="error"
          showIcon
          message="学习反馈提交失败"
          description={error.message}
          action={<Button onClick={onResetError}>重试</Button>}
        />
      )}
    </>
  )
}
