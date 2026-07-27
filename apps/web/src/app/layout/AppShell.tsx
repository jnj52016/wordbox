import { Layout } from 'antd'
import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLearner } from '../../learner/useLearner'

const { Header, Sider } = Layout

const navigationItems = [
  { to: '/', label: '首页', end: true },
  { to: '/books', label: '词书' },
  { to: '/review', label: '复习' },
  { to: '/settings', label: '设置' },
]

function Navigation({ className = '' }: { className?: string }) {
  return (
    <nav className={className} aria-label="主导航">
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const learnerQuery = useLearner()

  return (
    <Layout className="app-layout">
      <Sider className="desktop-sidebar" width={224} theme="light">
        <Link className="brand sidebar-brand" to="/">
          WordBox
        </Link>
        <Navigation className="desktop-nav" />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Link className="brand mobile-brand" to="/">
            WordBox
          </Link>
          <span className="learner-status">
            {learnerQuery.isPending && '身份同步中'}
            {learnerQuery.isError && '身份同步失败'}
          </span>
        </Header>
        <main className="app-content">{children}</main>
      </Layout>
      <Navigation className="mobile-nav" />
    </Layout>
  )
}
