import { useEffect } from 'react'
import { Button, Card, Space, Tag, Typography } from 'antd'
import type { ReactNode } from 'react'
import type { Word } from '../../../api/types'
import { speakWord } from '../../../shared/lib/speech'

export function LearningWordCard({
  word,
  autoPronounce,
  onSpeak,
  children,
}: {
  word: Word
  autoPronounce: boolean
  onSpeak?: (supported: boolean) => void
  children?: ReactNode
}) {
  useEffect(() => {
    if (autoPronounce) {
      speakWord(word.spelling)
    }
  }, [autoPronounce, word.spelling])

  const handleSpeak = () => {
    onSpeak?.(speakWord(word.spelling))
  }

  return (
    <Card className="learning-card">
      <div className="learning-word-visual">
        {word.imageUrl ? (
          <img src={word.imageUrl} alt={word.spelling} />
        ) : (
          <span>{word.emoji ?? '📝'}</span>
        )}
      </div>
      <Typography.Title className="learning-spelling" level={1}>
        {word.spelling}
      </Typography.Title>
      <Space className="learning-pronunciation" size="middle">
        <Typography.Text type="secondary">{word.phonetic ?? '暂无音标'}</Typography.Text>
        <Button size="small" onClick={handleSpeak}>
          播放发音
        </Button>
      </Space>

      <div className="learning-details">
        <Typography.Title level={3}>{word.meaning}</Typography.Title>
        {word.partOfSpeech && <Tag color="blue">{word.partOfSpeech}</Tag>}
        {word.example && (
          <Typography.Paragraph className="word-example">
            {word.example}
            {word.exampleZh && <span>{word.exampleZh}</span>}
          </Typography.Paragraph>
        )}
      </div>
      {children}
    </Card>
  )
}
