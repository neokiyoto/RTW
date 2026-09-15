import { AppRoutes } from '../routes/AppRoutes'
import { useGame } from '../hooks/useGame'

export function App() {
  const session = useGame()
  return <AppRoutes session={session} />
}
