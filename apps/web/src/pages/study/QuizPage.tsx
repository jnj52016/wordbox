import { Alert } from 'antd'
import { useParams } from 'react-router-dom'
import { QuizHeader } from '../../features/quiz/components/QuizHeader'
import { QuizQuestionCard } from '../../features/quiz/components/QuizQuestionCard'
import { useQuizFlow } from '../../features/quiz/hooks/useQuizFlow'
import { ErrorState, LoadingState } from '../../shared/ui/PageState'

export function QuizPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const flow = useQuizFlow(sessionId)
  const session = flow.sessionQuery.data

  if (flow.sessionQuery.isPending || flow.questionsQuery.isPending) {
    return <LoadingState tip="正在准备测验…" />
  }

  if (!sessionId || !session || flow.sessionQuery.isError || flow.questionsQuery.isError) {
    return (
      <ErrorState
        message={!sessionId ? '测验地址无效' : '测验加载失败'}
        description={flow.sessionQuery.error?.message ?? flow.questionsQuery.error?.message}
      />
    )
  }

  if (!flow.question || flow.questions.length === 0) {
    return (
      <Alert
        className="mx-auto my-20 block text-center"
        type="warning"
        message="当前 Session 没有题目"
      />
    )
  }

  return (
    <div className="w-full max-w-[760px]">
      <QuizHeader
        mode={session.mode}
        unitId={session.unitId}
        questionIndex={flow.questionIndex}
        total={flow.questions.length}
      />
      <QuizQuestionCard
        question={flow.question}
        inputValue={flow.inputValue}
        answerResult={flow.answerResult}
        answerError={flow.answerMutation.error}
        answerPending={flow.answerMutation.isPending}
        completing={flow.completeMutation.isPending}
        isLastQuestion={flow.questionIndex === flow.questions.length - 1}
        onInputChange={flow.setInputValue}
        onSubmit={flow.submitAnswer}
        onNext={flow.goToNextQuestion}
        onResetError={() => flow.answerMutation.reset()}
      />
    </div>
  )
}
