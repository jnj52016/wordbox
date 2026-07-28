import { Alert, Button, Card, Empty, Spin, Typography } from 'antd'
import { Link, useParams } from 'react-router-dom'
import { LearningFeedbackActions } from '../../features/learning/components/LearningFeedbackActions'
import { LearningHeader } from '../../features/learning/components/LearningHeader'
import { LearningWordCard } from '../../features/learning/components/LearningWordCard'
import { useLearningFlow } from '../../features/learning/hooks/useLearningFlow'

export function LearnPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const flow = useLearningFlow(unitId)
  const learner = flow.learnerQuery.data
  const words = flow.wordsQuery.data

  if (flow.wordsQuery.isPending || flow.learnerQuery.isPending) {
    return <Spin className="mx-auto my-20 block text-center" size="large" tip="正在准备学习内容…" />
  }

  if (!unitId || !learner || !words || flow.wordsQuery.isError || flow.learnerQuery.isError) {
    return (
      <Alert
        className="mx-auto my-20 block max-w-[640px] text-left"
        type="error"
        showIcon
        message={!unitId ? '单元地址无效' : '学习内容加载失败'}
        description={flow.wordsQuery.error?.message ?? flow.learnerQuery.error?.message}
        action={
          <Button>
            <Link to="/books">返回词书</Link>
          </Button>
        }
      />
    )
  }

  if (flow.initialWords.length === 0) {
    return <Empty className="mx-auto my-20 text-center" description="这个单元还没有可学习的单词" />
  }

  if (!flow.currentWord) {
    return (
      <Card className="mx-auto my-20 w-full max-w-[640px] text-center">
        <Typography.Title level={2}>本轮学习完成</Typography.Title>
        <Typography.Paragraph type="secondary">正在创建测验 Session…</Typography.Paragraph>
        {flow.createSessionMutation.isError && (
          <Alert
            type="error"
            showIcon
            message="测验创建失败"
            description={flow.createSessionMutation.error.message}
            action={<Button onClick={flow.startQuiz}>重试</Button>}
          />
        )}
        {flow.createSessionMutation.isPending && <Spin />}
      </Card>
    )
  }

  const disabled =
    flow.learnerQuery.isPending ||
    flow.createSessionMutation.isPending ||
    flow.feedbackMutation.isPending

  return (
    <div className="w-full max-w-[760px]">
      <LearningHeader
        unitId={unitId}
        unitName={words.unit.name}
        completedCount={flow.completedCount}
        total={flow.initialWords.length}
      />
      <LearningWordCard
        word={flow.currentWord}
        autoPronounce={learner.autoPronounce}
        onSpeak={(supported) => {
          if (!supported) {
            window.alert('当前浏览器不支持语音播放')
          }
        }}
      >
        <LearningFeedbackActions
          disabled={disabled}
          error={flow.feedbackMutation.error}
          onResetError={() => flow.feedbackMutation.reset()}
          onFeedback={flow.handleFeedback}
        />
      </LearningWordCard>
    </div>
  )
}
