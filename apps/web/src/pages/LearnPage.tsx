import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Empty,
  Progress,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ProgressFeedback, Word } from '../api/client'
import { queryKeys } from '../api/queryKeys'
import { useLearner } from '../learner/useLearner'

type LearningFeedback = 'unknown' | 'familiar' | 'known'

function speakWord(spelling: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(spelling)
  utterance.lang = 'en-US'
  window.speechSynthesis.speak(utterance)
  return true
}

export function LearnPage() {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const learnerQuery = useLearner()
  const wordsQuery = useQuery({
    queryKey: queryKeys.unitWords(unitId ?? ''),
    queryFn: () => api.getUnitWords(unitId ?? ''),
    enabled: Boolean(unitId),
  })
  const createSessionMutation = useMutation({ mutationFn: api.createStudySession })
  const feedbackMutation = useMutation({ mutationFn: api.submitProgressFeedback })
  const [queueIds, setQueueIds] = useState<string[] | null>(null)
  const [completedCount, setCompletedCount] = useState(0)
  const actionLock = useRef(false)

  const initialWords = wordsQuery.data?.words.slice(0, 10) ?? []
  const initialIds = initialWords.map((word) => word.id)
  const activeIds = queueIds ?? initialIds
  const wordsById = useMemo(
    () => new Map((wordsQuery.data?.words ?? []).map((word) => [word.id, word])),
    [wordsQuery.data?.words],
  )
  const queue = activeIds
    .map((id) => wordsById.get(id))
    .filter((word): word is Word => Boolean(word))
  const currentWord = queue[0]

  useEffect(() => {
    setQueueIds(null)
    setCompletedCount(0)
    actionLock.current = false
  }, [unitId])

  useEffect(() => {
    if (currentWord && learnerQuery.data?.autoPronounce) {
      speakWord(currentWord.spelling)
    }
  }, [currentWord?.id, learnerQuery.data?.autoPronounce])

  const startQuiz = () => {
    if (!unitId || !learnerQuery.data) {
      actionLock.current = false
      return
    }

    createSessionMutation.mutate(
      {
        learnerId: learnerQuery.publicId,
        unitId,
        count: initialWords.length,
      },
      {
        onSuccess: (session) => navigate(`/quiz/${session.id}`),
        onError: () => {
          actionLock.current = false
        },
      },
    )
  }

  const handleFeedback = (feedback: LearningFeedback) => {
    if (
      !currentWord ||
      !learnerQuery.data ||
      actionLock.current ||
      createSessionMutation.isPending ||
      feedbackMutation.isPending
    ) {
      return
    }

    actionLock.current = true
    const feedbackMap: Record<LearningFeedback, ProgressFeedback> = {
      unknown: 'UNKNOWN',
      familiar: 'FAMILIAR',
      known: 'KNOWN',
    }
    const wordId = currentWord.id

    feedbackMutation.mutate(
      { learnerId: learnerQuery.publicId, wordId, feedback: feedbackMap[feedback] },
      {
        onSuccess: () => {
          const remainingIds = activeIds.slice(1)

          if (feedback === 'unknown') {
            setQueueIds([...remainingIds, wordId])
            window.setTimeout(() => {
              actionLock.current = false
            }, 250)
            return
          }

          setCompletedCount((count) => count + 1)
          setQueueIds(remainingIds)

          if (remainingIds.length === 0) {
            startQuiz()
            return
          }

          window.setTimeout(() => {
            actionLock.current = false
          }, 250)
        },
        onError: () => {
          actionLock.current = false
        },
      },
    )
  }

  if (wordsQuery.isPending || learnerQuery.isPending) {
    return <Spin className="page-state" size="large" tip="正在准备学习内容…" />
  }

  if (!unitId || wordsQuery.isError || learnerQuery.isError) {
    return (
      <Alert
        className="page-state page-state-error"
        type="error"
        showIcon
        message={!unitId ? '单元地址无效' : '学习内容加载失败'}
        description={wordsQuery.error?.message ?? learnerQuery.error?.message}
        action={
          <Button>
            <Link to="/books">返回词书</Link>
          </Button>
        }
      />
    )
  }

  if (initialWords.length === 0) {
    return <Empty className="page-state" description="这个单元还没有可学习的单词" />
  }

  if (!currentWord) {
    return (
      <Card className="learning-complete-card">
        <Typography.Title level={2}>本轮学习完成</Typography.Title>
        <Typography.Paragraph type="secondary">
          正在创建测验 Session…
        </Typography.Paragraph>
        {createSessionMutation.isError && (
          <Alert
            type="error"
            showIcon
            message="测验创建失败"
            description={createSessionMutation.error.message}
            action={<Button onClick={startQuiz}>重试</Button>}
          />
        )}
        {createSessionMutation.isPending && <Spin />}
      </Card>
    )
  }

  const progressPercent = Math.round((completedCount / initialWords.length) * 100)

  return (
    <div className="page-shell learning-shell">
      <Breadcrumb
        className="page-breadcrumb"
        items={[{ title: <Link to="/books">词书</Link> }, { title: wordsQuery.data.unit.name }]}
      />

      <div className="section-heading learning-heading">
        <div>
          <Typography.Title level={2}>学习单词</Typography.Title>
          <Typography.Text type="secondary">
            第 {Math.min(completedCount + 1, initialWords.length)} / {initialWords.length} 个
          </Typography.Text>
        </div>
        <Button>
          <Link to={`/units/${unitId}/words`}>返回单词列表</Link>
        </Button>
      </div>

      <Progress percent={progressPercent} showInfo={false} />

      <Card className="learning-card">
        <div className="learning-word-visual">
          {currentWord.imageUrl ? (
            <img src={currentWord.imageUrl} alt={currentWord.spelling} />
          ) : (
            <span>{currentWord.emoji ?? '📝'}</span>
          )}
        </div>
        <Typography.Title className="learning-spelling" level={1}>
          {currentWord.spelling}
        </Typography.Title>
        <Space className="learning-pronunciation" size="middle">
          <Typography.Text type="secondary">{currentWord.phonetic ?? '暂无音标'}</Typography.Text>
          <Button
            size="small"
            onClick={() => {
              if (!speakWord(currentWord.spelling)) {
                window.alert('当前浏览器不支持语音播放')
              }
            }}
          >
            播放发音
          </Button>
        </Space>

        <div className="learning-details">
          <Typography.Title level={3}>{currentWord.meaning}</Typography.Title>
          {currentWord.partOfSpeech && <Tag color="blue">{currentWord.partOfSpeech}</Tag>}
          {currentWord.example && (
            <Typography.Paragraph className="word-example">
              {currentWord.example}
              {currentWord.exampleZh && <span>{currentWord.exampleZh}</span>}
            </Typography.Paragraph>
          )}
        </div>

        <Typography.Paragraph className="learning-prompt" type="secondary">
          你对这个单词的熟悉程度如何？
        </Typography.Paragraph>
        <Space className="learning-actions" wrap>
          <Button
            danger
            size="large"
            disabled={
              learnerQuery.isPending ||
              createSessionMutation.isPending ||
              feedbackMutation.isPending
            }
            onClick={() => handleFeedback('unknown')}
          >
            不认识
          </Button>
          <Button
            size="large"
            disabled={
              learnerQuery.isPending ||
              createSessionMutation.isPending ||
              feedbackMutation.isPending
            }
            onClick={() => handleFeedback('familiar')}
          >
            有印象
          </Button>
          <Button
            type="primary"
            size="large"
            disabled={
              learnerQuery.isPending ||
              createSessionMutation.isPending ||
              feedbackMutation.isPending
            }
            onClick={() => handleFeedback('known')}
          >
            认识
          </Button>
        </Space>
        {feedbackMutation.isError && (
          <Alert
            className="quiz-feedback"
            type="error"
            showIcon
            message="学习反馈提交失败"
            description={feedbackMutation.error.message}
            action={<Button onClick={() => feedbackMutation.reset()}>重试</Button>}
          />
        )}
      </Card>
    </div>
  )
}
