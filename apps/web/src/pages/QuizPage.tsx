import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Input,
  Progress,
  Space,
  Spin,
  Typography,
} from 'antd'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, StudyAnswerResult, StudyQuestion } from '../api/client'
import { queryKeys } from '../api/queryKeys'

export function QuizPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const sessionQuery = useQuery({
    queryKey: queryKeys.studySession(sessionId ?? ''),
    queryFn: () => api.getStudySession(sessionId ?? ''),
    enabled: Boolean(sessionId),
  })
  const questionsQuery = useQuery({
    queryKey: queryKeys.studyQuestions(sessionId ?? ''),
    queryFn: () => api.getStudyQuestions(sessionId ?? ''),
    enabled: Boolean(sessionId),
  })
  const answerMutation = useMutation({
    mutationFn: (input: {
      questionId: string
      questionType: StudyQuestion['questionType']
      answer: string
    }) =>
      api.submitStudyAnswer(sessionId ?? '', input),
  })
  const completeMutation = useMutation({
    mutationFn: () => api.completeStudySession(sessionId ?? ''),
  })
  const [questionIndex, setQuestionIndex] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [answerResult, setAnswerResult] = useState<StudyAnswerResult | null>(null)

  const questions = questionsQuery.data ?? []
  const question = questions[questionIndex]

  useEffect(() => {
    setInputValue('')
    setAnswerResult(null)
  }, [question?.questionId])

  const submitAnswer = (answer: string) => {
    if (!question || !sessionId || answerResult || answerMutation.isPending || !answer.trim()) {
      return
    }

    answerMutation.mutate(
      {
        questionId: question.questionId,
        questionType: question.questionType,
        answer,
      },
      {
        onSuccess: (result) => setAnswerResult(result),
      },
    )
  }

  const goToNextQuestion = () => {
    if (!sessionId || !answerResult) {
      return
    }

    if (questionIndex < questions.length - 1) {
      setQuestionIndex((index) => index + 1)
      return
    }

    completeMutation.mutate(undefined, {
      onSuccess: (session) => navigate(`/result/${session.id}`),
    })
  }

  if (sessionQuery.isPending || questionsQuery.isPending) {
    return <Spin className="page-state" size="large" tip="正在准备测验…" />
  }

  if (!sessionId || sessionQuery.isError || questionsQuery.isError) {
    return (
      <Alert
        className="page-state page-state-error"
        type="error"
        showIcon
        message={!sessionId ? '测验地址无效' : '测验加载失败'}
        description={sessionQuery.error?.message ?? questionsQuery.error?.message}
        action={
          <Button>
            <Link to="/books">返回词书</Link>
          </Button>
        }
      />
    )
  }

  if (!question || questions.length === 0) {
    return <Alert className="page-state" type="warning" message="当前 Session 没有题目" />
  }

  const isSpellingQuestion = question.questionType === 'SPELLING'
  const progressPercent = Math.round((questionIndex / questions.length) * 100)

  return (
    <div className="page-shell learning-shell">
      <Breadcrumb
        className="page-breadcrumb"
        items={[{ title: <Link to="/books">词书</Link> }, { title: '测验' }]}
      />

      <div className="section-heading learning-heading">
        <div>
          <Typography.Title level={2}>单词测验</Typography.Title>
          <Typography.Text type="secondary">
            第 {questionIndex + 1} / {questions.length} 题
          </Typography.Text>
        </div>
        <Button>
          <Link
            to={
              sessionQuery.data.mode === 'REVIEW'
                ? '/review'
                : `/learn/${sessionQuery.data.unitId}`
            }
          >
            返回学习
          </Link>
        </Button>
      </div>

      <Progress percent={progressPercent} showInfo={false} />

      <Card className="learning-card quiz-card">
        <Typography.Text type="secondary">
          {question.questionType === 'EN_TO_ZH'
            ? '看英文选中文'
            : question.questionType === 'ZH_TO_EN'
              ? '看中文选英文'
              : '英文拼写'}
        </Typography.Text>
        <div className="quiz-prompt">
          {question.emoji && <span className="word-emoji">{question.emoji}</span>}
          <Typography.Title level={1}>{question.prompt}</Typography.Title>
          {question.phonetic && (
            <Typography.Text type="secondary">{question.phonetic}</Typography.Text>
          )}
        </div>

        {isSpellingQuestion ? (
          <Space.Compact className="quiz-input">
            <Input
              value={inputValue}
              placeholder="输入英文拼写"
              disabled={Boolean(answerResult) || answerMutation.isPending}
              onChange={(event) => setInputValue(event.target.value)}
              onPressEnter={() => submitAnswer(inputValue)}
            />
            <Button
              type="primary"
              loading={answerMutation.isPending}
              disabled={Boolean(answerResult)}
              onClick={() => submitAnswer(inputValue)}
            >
              提交
            </Button>
          </Space.Compact>
        ) : (
          <div className="quiz-options">
            {question.options.map((option) => (
              <Button
                key={option}
                size="large"
                type={answerResult && option === answerResult.correctAnswer ? 'primary' : 'default'}
                danger={Boolean(answerResult && option !== answerResult.correctAnswer)}
                disabled={Boolean(answerResult) || answerMutation.isPending}
                loading={answerMutation.isPending}
                onClick={() => submitAnswer(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        )}

        {answerMutation.isError && (
          <Alert
            className="quiz-feedback"
            type="error"
            showIcon
            message="提交失败"
            description={answerMutation.error.message}
            action={<Button onClick={() => answerMutation.reset()}>重试</Button>}
          />
        )}

        {answerResult && (
          <Alert
            className="quiz-feedback"
            type={answerResult.isCorrect ? 'success' : 'error'}
            showIcon
            message={answerResult.isCorrect ? '回答正确' : '回答错误'}
            description={answerResult.isCorrect ? undefined : `正确答案：${answerResult.correctAnswer}`}
            action={
              <Button
                type="primary"
                loading={completeMutation.isPending}
                onClick={goToNextQuestion}
              >
                {questionIndex === questions.length - 1 ? '完成测验' : '下一题'}
              </Button>
            }
          />
        )}
      </Card>
    </div>
  )
}
