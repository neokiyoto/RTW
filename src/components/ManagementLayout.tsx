import { useEffect, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { GameSession } from '../hooks/useGame'
import { BrandMark } from './BrandMark'
import '../styles/management.css'
import { WeeklyProgress } from './WeeklyProgress'
import { getWeeklyFlow } from '../utils/weeklyFlow'
import { getTeamProfile } from '../utils/teamProfile'

export function ManagementLayout({ session, title, children }: {
  session: GameSession; title: string; children: ReactNode
}) {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash === '#weekly-activity') document.getElementById('weekly-activity')?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return (
    <div className="management-page">
      <header className="management-header">
        <NavLink className="brand" to="/dashboard"><BrandMark /><span>Road to Worlds</span></NavLink>
        <nav aria-label="Game navigation">
          <NavLink to="/dashboard">This week</NavLink>
          <NavLink to="/team">Roster</NavLink>
          <NavLink to="/standings">Standings</NavLink>
          <NavLink to="/">Game menu</NavLink>
        </nav>
        <button className="secondary-button" type="button" onClick={session.saveCurrentGame}>Save game</button>
      </header>
      <main>
        {session.game && <div className="club-strip"><strong>{getTeamProfile(session.game).teamName}</strong><span>Manager / {getTeamProfile(session.game).managerName}</span></div>}
        {session.game && <><p className="season-strip">Week {session.game.week} / {session.game.seasonLength} <span>{session.game.wins}W · {session.game.losses}L</span><span>{session.game.fans} fans</span></p><WeeklyProgress game={session.game} /></>}
        <h1>{title}</h1>
        <p className="save-message" role="status">{session.message}</p>
        {session.game && (title === 'Your team' || title === 'Season standings') && <NavLink className="flow-return" to={getWeeklyFlow(session.game).to}>← {getWeeklyFlow(session.game).action}</NavLink>}
        {children}
      </main>
    </div>
  )
}
