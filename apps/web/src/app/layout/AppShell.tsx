import { Layout, Tooltip } from 'antd'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLearner } from '../../learner/useLearner'

const { Header } = Layout

const navigationItems = [
  { to: '/', label: '首页', end: true },
  { to: '/books', label: '词书' },
  { to: '/review', label: '复习' },
  { to: '/settings', label: '设置' },
]

function Navigation({
  className = '',
  collapsed = false,
}: {
  className?: string
  collapsed?: boolean
}) {
  return (
    <nav className={className} aria-label="主导航">
      {navigationItems.map((item) => (
        <Tooltip key={item.to} title={collapsed ? item.label : undefined} placement="right">
          <NavLink
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `block rounded-[10px] px-3 py-[11px] text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 ${
                collapsed ? 'text-center' : ''
              } ${isActive ? 'bg-blue-50 text-blue-600' : ''}`
            }
          >
            {item.label}
          </NavLink>
        </Tooltip>
      ))}
    </nav>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const learnerQuery = useLearner()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout className="min-h-screen bg-slate-50 font-sans">
      <Layout.Sider
        collapsible
        collapsed={collapsed}
        collapsedWidth={72}
        onCollapse={setCollapsed}
        className="bg-white shadow-none max-[480px]:hidden [&_.ant-layout-sider-children]:flex [&_.ant-layout-sider-children]:flex-col [&_.ant-layout-sider-children]:px-4 [&_.ant-layout-sider-children]:py-6 [&_.ant-layout-sider-trigger]:border-0 [&_.ant-layout-sider-trigger]:bg-white [&_.ant-layout-sider-trigger]:text-slate-500"
        width={224}
        theme="light"
      >
        <Link
          className={`pb-7 text-xl font-bold text-slate-900 ${collapsed ? 'px-0 text-center' : 'px-3'}`}
          to="/"
        >
          {collapsed ? 'W' : 'WordBox'}
        </Link>
        <Navigation className="flex flex-col gap-2" collapsed={collapsed} />
      </Layout.Sider>
      <Layout>
        <Header className="flex items-center border-b border-slate-200 bg-white px-6 max-[480px]:h-14 max-[480px]:px-4">
          <Link className="hidden text-xl font-bold text-slate-900 max-[480px]:inline" to="/">
            WordBox
          </Link>
          <span className="ml-auto text-xs text-slate-400">
            {learnerQuery.isPending && '身份同步中'}
            {learnerQuery.isError && '身份同步失败'}
          </span>
        </Header>
        <main className="flex min-w-0 w-full justify-center px-6 py-12 max-[480px]:px-4 max-[480px]:pb-[calc(88px+env(safe-area-inset-bottom))] max-[480px]:pt-6">
          {children}
        </main>
      </Layout>
      <Navigation className="fixed inset-x-0 bottom-0 z-10 hidden grid-cols-4 gap-1 border-t border-slate-200 bg-white/95 p-2 shadow-[0_-4px_16px_rgb(15_23_42_/_6%)] max-[480px]:grid max-[480px]:pb-[calc(8px+env(safe-area-inset-bottom))] [&_a]:px-1 [&_a]:py-2 [&_a]:text-center [&_a]:text-xs" />
    </Layout>
  )
}
