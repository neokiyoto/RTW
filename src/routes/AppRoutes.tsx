import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '../pages/DashboardPage'
import { TeamPage } from '../pages/TeamPage'
import { MatchPage } from '../pages/MatchPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { StandingsPage } from '../pages/StandingsPage'
import type { GameSession } from '../hooks/useGame'

export function AppRoutes({ session }: { session: GameSession }) {
  return (
    <Routes>
      <Route path="/" element={<HomePage session={session} />} />
      <Route path="/dashboard" element={session.game ? <DashboardPage game={session.game} session={session} /> : <Navigate to="/" replace />} />
      <Route path="/team" element={session.game ? <TeamPage game={session.game} session={session} /> : <Navigate to="/" replace />} />
      <Route path="/match" element={session.game ? <MatchPage game={session.game} session={session} /> : <Navigate to="/" replace />} />
      <Route path="/standings" element={session.game ? <StandingsPage game={session.game} session={session} /> : <Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
