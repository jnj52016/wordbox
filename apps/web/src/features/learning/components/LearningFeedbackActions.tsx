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
      <Typography.Paragraph className="my-7 mb-3" type="secondary">
        你对这个单词的熟悉程度如何？
      </Typography.Paragraph>
      <Space className="justify-center max-[480px]:flex max-[480px]:w-full" wrap>
        <Button
          autoInsertSpace={false}
          danger
          className="max-[480px]:flex-1"
          size="large"
          disabled={disabled}
          onClick={() => onFeedback('unknown')}
        >
          不认识
        </Button>
        <Button
          autoInsertSpace={false}
          className="max-[480px]:flex-1"
          size="large"
          disabled={disabled}
          onClick={() => onFeedback('familiar')}
        >
          有印象
        </Button>
        <Button
          autoInsertSpace={false}
          type="primary"
          className="max-[480px]:flex-1"
          size="large"
          disabled={disabled}
          onClick={() => onFeedback('known')}
        >
          认识
        </Button>
      </Space>
      {error && (
        <Alert
          className="mt-6 text-left"
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
