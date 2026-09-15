import { Link } from 'react-router-dom'
import type { GameState } from '../types/gameState'
import { getWeeklyFlow } from '../utils/weeklyFlow'

export function WeeklyProgress({ game }: { game: GameState }) {
  const current = getWeeklyFlow(game).step
  const steps = ['Weekly activity', 'Line-up & strategy', 'Match & result']
  return <nav aria-label="Weekly progress" className="weekly-progress"><ol>
    {steps.map((label, index) => <li key={label} className={index < current ? 'step-done' : index === current ? 'step-current' : ''}>
      {index <= current ? <Link to={index === 0 ? '/dashboard#weekly-activity' : '/match'} aria-current={index === current ? 'step' : undefined}><span>{index < current ? '✓' : index + 1}</span>{label}<small>{index < current ? 'Complete' : 'Current step'}</small></Link>
        : <span className="step-pending"><span>{index + 1}</span>{label}<small>Up next</small></span>}
    </li>)}
  </ol></nav>
}
