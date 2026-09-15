import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ManagementLayout } from '../components/ManagementLayout'
import { activities } from '../data/activities'
import { strategies } from '../data/strategies'
import { weeklyEvents } from '../data/weeklyEvents'
import type { GameSession } from '../hooks/useGame'
import type { GameState } from '../types/gameState'
import type { ActivityId, TrainingAttribute, WeeklyActivity } from '../types/management'
import { getDevelopmentChance } from '../utils/management'
import { getCurrentOpponent } from '../utils/season'
import { getWeeklyFlow } from '../utils/weeklyFlow'

export function DashboardPage({ game, session }: { game: GameState; session: GameSession }) {
  const [activityId, setActivityId] = useState<ActivityId>('team-training')
  const [playerId, setPlayerId] = useState(game.players[0].id)
  const [attribute, setAttribute] = useState<TrainingAttribute>('mechanics')
  const opponent = getCurrentOpponent(game)
  const flow = getWeeklyFlow(game)
  const analysed = game.opponentKnowledge === 3
  const selectedPlayer = game.players.find((player) => player.id === playerId)!
  const developmentChance = selectedPlayer[attribute] === 100 ? 0 : Math.round(getDevelopmentChance(selectedPlayer.potential, selectedPlayer[attribute]) * 100)

  function resolve() {
    const choice: WeeklyActivity = activityId === 'individual-training'
      ? { id: activityId, playerId, attribute }
      : { id: activityId }
    session.resolveActivity(choice)
  }

  if (game.seasonStatus === 'complete') return (
    <ManagementLayout session={session} title="Season complete">
      <section className="management-card"><h2>{game.wins} wins · {game.losses} losses</h2><p>Your six-match season is complete.</p><p><Link to="/standings">View final standings and season result</Link>.</p></section>
    </ManagementLayout>
  )

  return (
    <ManagementLayout session={session} title="This week">
      <section className="management-card next-action"><p className="eyebrow">Week {game.week} · vs {opponent.name}</p><h2>{flow.title}</h2><p>{flow.description}</p>{flow.step === 0 ? <a className="primary-button" href="#weekly-activity">{flow.action} ↓</a> : <Link className="primary-button" to={flow.to}>{flow.action} →</Link>}</section>
      <div className="week-layout"><div>
      <p className="condition-summary">Team averages: Morale {Math.round(game.players.reduce((sum, player) => sum + player.morale, 0) / 5)}/100 · Fatigue {Math.round(game.players.reduce((sum, player) => sum + player.fatigue, 0) / 5)}/100. Higher fatigue means more tired.</p>
      <section id="weekly-activity" className="management-card" aria-labelledby="activity-title">
        <h2 id="activity-title">{game.weeklyReport ? 'Your weekly preparation' : 'Choose one weekly activity'}</h2>
        {game.weeklyReport ? (
          <div role="status">
            <h3>Week {game.week} activity complete</h3>
            <p><strong>{activities.find((activity) => activity.id === game.selectedWeeklyActivity?.id)?.name}</strong></p>
            <p>{game.weeklyReport.activitySummary}</p>
            <h3>Weekly event: {weeklyEvents.find((event) => event.id === game.weeklyReport?.event.id)?.title}</h3>
            <p>{game.weeklyReport.event.summary}</p>
            <details><summary>See all changes</summary>
            <ul>{game.weeklyReport.changes.map((change, index) => <li key={index}>{change}</li>)}</ul></details>
            <Link className="primary-button" to="/match">{game.currentMatch ? 'Watch match & result' : 'Continue to line-up & strategy'} →</Link>
          </div>
        ) : (
          <form onSubmit={(event) => { event.preventDefault(); resolve() }}>
            <p>What does your team need before this match? Pick one activity; its effects apply immediately when you confirm.</p>
            <fieldset className="activity-options">
              <legend>Choose your weekly activity</legend>
              {activities.map((activity) => (
                <label key={activity.id} className="activity-option">
                  <input type="radio" name="weekly-activity" value={activity.id} checked={activityId === activity.id} onChange={() => setActivityId(activity.id)} />
                  <span><strong>{activity.name}</strong><span>{activity.description}</span></span>
                </label>
              ))}
            </fieldset>
            {activityId === 'individual-training' && (
              <div className="training-options">
                <label>Player to train<select value={playerId} onChange={(event) => setPlayerId(event.target.value)}>{game.players.map((player) => <option value={player.id} key={player.id}>{player.name} — {player.role}</option>)}</select></label>
                <label>Attribute to train<select value={attribute} onChange={(event) => setAttribute(event.target.value as TrainingAttribute)}><option value="mechanics">Mechanics</option><option value="gameSense">Game Sense</option></select></label>
                <p>Chance of improvement: {developmentChance}%. Current rating: {selectedPlayer[attribute]}/100.</p>
              </div>
            )}
            <button type="submit" className="primary-button">Complete weekly activity</button>
          </form>
        )}
      </section>
      </div><aside aria-label="Team and opponent overview">      <section className="management-card" aria-labelledby="condition-title">
        <h2 id="condition-title">Your players</h2>
        <p>High fatigue? Consider Rest. Low morale? Try Team Building. <Link to="/team">View the full roster</Link>.</p>
        <ul className="condition-list">
          {game.players.map((player) => <li key={player.id}><strong>{player.role} — {player.name}</strong><span>Morale {player.morale}/100 · Fatigue {player.fatigue}/100</span></li>)}
        </ul>
      </section>
      <section className="management-card" aria-labelledby="opponent-title">
        <h2 id="opponent-title">Next opponent: {opponent.name}</h2>
        <p>Fixture {game.week} of {game.seasonLength}</p>
        {opponent.roster.length > 0 && <details><summary>Opposing line-up</summary><ul className="condition-list">{opponent.roster.map((player) => <li key={player.role}><strong>{player.role} · {player.name}</strong><span>{player.fullName}</span></li>)}</ul></details>}
        {analysed ? (
          <>
            <p>{opponent.identity}</p>
            <dl className="stat-list opponent-details">
              <div><dt>Overall strength</dt><dd>{opponent.overallStrength}/100</dd></div>
              <div><dt>Preferred strategy</dt><dd>{strategies.find((strategy) => strategy.id === opponent.preferredStrategyId)?.name}</dd></div>
              <div><dt>Strong phase</dt><dd>{opponent.strongPhase}</dd></div>
              <div><dt>Weak phase</dt><dd>{opponent.weakPhase}</dd></div>
              <div><dt>Notable player</dt><dd>{opponent.notablePlayer.name} ({opponent.notablePlayer.role}) — {opponent.notablePlayer.description}</dd></div>
              <div><dt>Exploitable weakness</dt><dd>{opponent.exploitableWeakness}</dd></div>
              <div><dt>Drafting tendency</dt><dd>{opponent.draftingTendency}</dd></div>
            </dl>
          </>
        ) : <p>Tactical details are unknown. Choose Opponent Analysis to reveal their full profile.</p>}
      </section>
<p className="overview-note">Team synergy: {game.teamSynergy}/100</p></aside></div>
    </ManagementLayout>
  )
}
