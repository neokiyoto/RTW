import { Link, useNavigate } from 'react-router-dom'
import { ManagementLayout } from '../components/ManagementLayout'
import { MatchReportView } from '../components/MatchReportView'
import { champions } from '../data/champions'
import { strategies } from '../data/strategies'
import type { GameSession } from '../hooks/useGame'
import type { GameState } from '../types/gameState'
import { getMatchReadinessErrors, isEligibleForRole, ROLES } from '../utils/matchPreparation'
import { getSeasonResult } from '../utils/season'

export function MatchPage({ game, session }: { game: GameState; session: GameSession }) {
  const navigate = useNavigate()
  const errors = getMatchReadinessErrors(game)
  const strategy = strategies.find((entry) => entry.id === game.selectedStrategyId)

  if (game.seasonStatus === 'complete') return <ManagementLayout session={session} title="Season complete"><section className="management-card"><h2>{game.wins} wins · {game.losses} losses</h2><p>{getSeasonResult(game)}</p><p><Link to="/standings">View final standings</Link></p><button className="primary-button" onClick={session.startNewSeason}>Start new season</button></section></ManagementLayout>
  if (game.currentMatch) return <ManagementLayout session={session} title="Match day"><MatchReportView game={game} report={game.currentMatch} onAdvance={() => { session.advanceWeek(); navigate(game.week === game.seasonLength ? '/standings' : '/dashboard') }} /></ManagementLayout>
  if (!game.weeklyReport) return <ManagementLayout session={session} title="Prepare for match day"><section className="management-card next-action"><p className="eyebrow">Step 1 of 3</p><h2>Prepare your players first</h2><p>Choose this week’s activity before setting your line-up. Their condition can help you decide how to play.</p><Link className="primary-button" to="/dashboard#weekly-activity">Choose weekly activity →</Link></section></ManagementLayout>

  return (
    <ManagementLayout session={session} title="Match preparation">
      <p>Choose five champions, then a strategy. Preferred champions are marked to help you get started.</p>
      <section className="management-card" aria-labelledby="readiness-title">
        <h2 id="readiness-title">{errors.length === 0 ? 'Ready for match day' : `${Object.values(game.championAssignments).filter(Boolean).length} of 5 champions selected`}</h2>
        <div role="status">
          {errors.length > 0 ? <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul> : <p>Weekly activity complete. All five champions and your strategy are selected.</p>}
        </div>
        <p>Activity complete · Strategy {strategy ? 'selected' : 'still to choose'}. You can change your plan until the match starts.</p>
      </section>
      <section aria-labelledby="champions-title">
        <h2 id="champions-title">1. Choose your champions</h2>
        <p>One champion per role. A champion cannot be assigned twice.</p>
        <div className="player-grid">
          {ROLES.map((role) => {
            const player = game.players.find((entry) => entry.role === role)!
            const eligible = champions.filter((champion) => isEligibleForRole(champion, role))
            const selected = champions.find((champion) => champion.id === game.championAssignments[role])
            return (
              <article className="management-card" key={role}>
                <h3>{role} — {player.name}</h3>
                <p>{player.roleFocus} · {player.playstyle} · Morale {player.morale} · Fatigue {player.fatigue}</p>
                <div className="training-options">
                  <label htmlFor={`champion-${role}`}>Champion for {role}</label>
                  <select id={`champion-${role}`} value={game.championAssignments[role] ?? ''} onChange={(event) => session.assignChampion(role, event.target.value || null)}>
                    <option value="">Choose a champion</option>
                    {eligible.map((champion) => {
                      const assignedRole = ROLES.find((otherRole) => otherRole !== role && game.championAssignments[otherRole] === champion.id)
                      return <option key={champion.id} value={champion.id} disabled={assignedRole !== undefined}>
                        {champion.name} — {champion.primaryRole === role ? 'primary role' : 'secondary role'}{player.preferredChampionIds.includes(champion.id) ? ' · preferred' : ''}{assignedRole ? ` · assigned to ${assignedRole}` : ''}
                      </option>
                    })}
                  </select>
                </div>
                {selected && (
                  <>
                    <p><strong>{selected.archetype}</strong> · {selected.primaryRole === role ? 'Primary role' : 'Secondary role'} · {player.preferredChampionIds.includes(selected.id) ? 'Preferred champion' : 'Not a preferred champion'} · {selected.archetype === player.roleFocus ? 'Focus match' : 'Different focus'}</p>
                    <details><summary>Champion ratings</summary><dl className="stat-list">
                      <div><dt>Early game</dt><dd>{selected.earlyGame}/100</dd></div>
                      <div><dt>Late game</dt><dd>{selected.lateGame}/100</dd></div>
                      <div><dt>Team fighting</dt><dd>{selected.teamFighting}/100</dd></div>
                      <div><dt>Difficulty</dt><dd>{selected.difficulty}/100</dd></div>
                    </dl>
                    <p>Higher difficulty means harder to play.</p></details>
                  </>
                )}
              </article>
            )
          })}
        </div>
      </section>
      <section className="management-card" aria-labelledby="strategy-title">
        <h2 id="strategy-title">2. Choose your strategy</h2>
        <fieldset className="activity-options">
          <legend>Choose your approach</legend>
          <label className="activity-option"><input type="radio" name="strategy" checked={game.selectedStrategyId === null} onChange={() => session.selectStrategy(null)} /><span>No strategy selected</span></label>
          {strategies.map((entry) => (
            <label className="activity-option" key={entry.id}>
              <input type="radio" name="strategy" checked={game.selectedStrategyId === entry.id} onChange={() => session.selectStrategy(entry.id)} />
              <span><strong>{entry.name}</strong><span>{entry.description}</span><span>Supporting focuses: {entry.supportingFocuses.join(', ')}.</span></span>
            </label>
          ))}
        </fieldset>
        <p>Selected strategy: <strong>{strategy?.name ?? 'None'}</strong></p>
      </section>
      <section className="management-card match-launch"><div><h2>3. Take your team into the match</h2><p>{errors.length ? 'Finish the choices above to unlock your match.' : 'Everything is set. Watch your plan unfold.'}</p></div><button className="primary-button" disabled={errors.length > 0} onClick={() => { session.playMatch(); window.scrollTo(0, 0) }}>Play match →</button></section>
    </ManagementLayout>
  )
}
