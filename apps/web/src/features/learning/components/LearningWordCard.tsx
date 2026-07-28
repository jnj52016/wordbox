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
    <Card className="mt-6 p-7 text-center max-[480px]:px-4 max-[480px]:py-5">
      <div className="mx-auto mb-5 grid h-[120px] w-[120px] place-items-center overflow-hidden rounded-3xl bg-blue-50 text-[64px] text-blue-600 max-[480px]:h-24 max-[480px]:w-24 max-[480px]:text-5xl">
        {word.imageUrl ? (
          <img className="h-full w-full object-cover" src={word.imageUrl} alt={word.spelling} />
        ) : (
          <span>{word.emoji ?? '📝'}</span>
        )}
      </div>
      <Typography.Title className="!mb-1" level={1}>
        {word.spelling}
      </Typography.Title>
      <Space className="justify-center" size="middle">
        <Typography.Text type="secondary">{word.phonetic ?? '暂无音标'}</Typography.Text>
        <Button size="small" onClick={handleSpeak}>
          播放发音
        </Button>
      </Space>

      <div className="mt-7 min-h-[150px] rounded-2xl bg-slate-50 p-6 text-left">
        <Typography.Title className="!mt-0" level={3}>
          {word.meaning}
        </Typography.Title>
        {word.partOfSpeech && <Tag color="blue">{word.partOfSpeech}</Tag>}
        {word.example && (
          <Typography.Paragraph className="mt-4">
            {word.example}
            {word.exampleZh && <span className="mt-1 block">{word.exampleZh}</span>}
          </Typography.Paragraph>
        )}
      </div>
      {children}
    </Card>
  )
}
