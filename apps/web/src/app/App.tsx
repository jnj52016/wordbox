import { AppRoutes } from './routes'
import { AppShell } from './layout/AppShell'

export default function App() {
  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  )
}
