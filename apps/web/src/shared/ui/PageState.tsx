import { Alert, Button, Empty, Spin } from 'antd'
import { Link } from 'react-router-dom'

export function LoadingState({ tip = '正在加载…' }: { tip?: string }) {
  return <Spin className="mx-auto my-20 block text-center" size="large" tip={tip} />
}

export function EmptyState({ description }: { description: string }) {
  return <Empty className="mx-auto my-20 text-center" description={description} />
}

export function ErrorState({
  message,
  description,
  backTo = '/books',
  backLabel = '返回词书',
  onRetry,
}: {
  message: string
  description?: string
  backTo?: string
  backLabel?: string
  onRetry?: () => void
}) {
  return (
    <Alert
      className="mx-auto my-20 block max-w-[640px] text-left"
      type="error"
      showIcon
      message={message}
      description={description}
      action={
        onRetry ? (
          <Button onClick={onRetry}>重试</Button>
        ) : (
          <Button>
            <Link to={backTo}>{backLabel}</Link>
          </Button>
        )
      }
    />
  )
}
