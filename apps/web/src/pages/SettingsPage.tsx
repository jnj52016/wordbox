import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Card,
  Form,
  InputNumber,
  Modal,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd'
import { useLearner } from '../learner/useLearner'
import { api } from '../api/client'
import { queryKeys } from '../api/queryKeys'

type SettingsFormValues = {
  dailyGoal: number
  autoPronounce: boolean
}

export function SettingsPage() {
  const { publicId, data: learner, isPending, isError, error } = useLearner()
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)

  if (isPending) {
    return (
      <div className="page-shell settings-shell">
        <Card loading className="settings-card" />
      </div>
    )
  }

  if (isError || !learner) {
    return (
      <Alert
        className="page-state page-state-error"
        type="error"
        showIcon
        message="学习者信息加载失败"
        description={error?.message}
      />
    )
  }

  const saveSettings = async (values: SettingsFormValues) => {
    setSaving(true)
    try {
      const updatedLearner = await api.updateLearnerSettings(publicId, values)
      queryClient.setQueryData(queryKeys.learner(publicId), updatedLearner)
      message.success('设置已保存')
    } catch (saveError) {
      message.error(saveError instanceof Error ? saveError.message : '设置保存失败')
    } finally {
      setSaving(false)
    }
  }

  const resetProgress = () => {
    Modal.confirm({
      title: '确定要重置学习进度吗？',
      content: '这会删除学习记录、答题记录和单词掌握进度，匿名身份和设置会保留。',
      okText: '确认重置',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        setResetting(true)
        try {
          await api.resetLearnerProgress(publicId)
          await queryClient.invalidateQueries({ queryKey: queryKeys.learner(publicId) })
          message.success('学习进度已重置')
        } catch (resetError) {
          message.error(resetError instanceof Error ? resetError.message : '进度重置失败')
          throw resetError
        } finally {
          setResetting(false)
        }
      },
    })
  }

  return (
    <div className="page-shell settings-shell">
      <div className="settings-intro">
        <Typography.Title level={2}>设置</Typography.Title>
        <Typography.Paragraph type="secondary">
          调整每日学习目标和单词发音偏好。
        </Typography.Paragraph>
      </div>

      <Card className="settings-card">
        <Form<SettingsFormValues>
          layout="vertical"
          initialValues={{ dailyGoal: learner.dailyGoal, autoPronounce: learner.autoPronounce }}
          onFinish={saveSettings}
        >
          <Form.Item
            label="每日学习目标"
            name="dailyGoal"
            rules={[{ required: true, message: '请输入每日学习目标' }]}
          >
            <InputNumber min={1} max={100} addonAfter="个单词" />
          </Form.Item>
          <Form.Item
            label="自动发音"
            name="autoPronounce"
            valuePropName="checked"
            extra="进入学习卡片时自动播放单词发音。"
          >
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            保存设置
          </Button>
        </Form>
      </Card>

      <Card className="settings-card">
        <Typography.Title level={4}>匿名学习者</Typography.Title>
        <Space direction="vertical" size="small">
          <Typography.Text type="secondary">当前身份 ID</Typography.Text>
          <Typography.Text copyable={{ text: publicId }}>{publicId}</Typography.Text>
          <Tag color="green">数据仅与当前浏览器绑定</Tag>
        </Space>
      </Card>

      <Card className="settings-card danger-card">
        <Typography.Title level={4}>重置学习进度</Typography.Title>
        <Typography.Paragraph type="secondary">
          保留匿名身份和设置，只删除学习记录、答题记录和单词掌握进度。
        </Typography.Paragraph>
        <Button danger loading={resetting} onClick={resetProgress}>
          重置学习进度
        </Button>
      </Card>
    </div>
  )
}
