import { champions } from '../data/champions'
import { ManagementLayout } from '../components/ManagementLayout'
import type { GameSession } from '../hooks/useGame'
import type { GameState } from '../types/gameState'
import { getOverallRating } from '../utils/management'
import { useState } from 'react'
import { TeamProfileForm } from '../components/TeamProfileForm'
import { getTeamProfile } from '../utils/teamProfile'

export function TeamPage({ game, session }: { game: GameState; session: GameSession }) {
  const [editing, setEditing] = useState(false)
  const captain = game.players.reduce((leader, player) => player.leadership > leader.leadership ? player : leader)
  return (
    <ManagementLayout session={session} title="Your team">
      <section className="management-card club-profile"><p className="eyebrow">Club identity</p><h2>{getTeamProfile(game).teamName}</h2><p>Managed by {getTeamProfile(game).managerName}</p>
        {editing ? <TeamProfileForm initial={getTeamProfile(game)} submitLabel="Save names" onCancel={() => setEditing(false)} onSave={(profile) => { session.updateTeamProfile(profile); setEditing(false) }} /> : <button className="secondary-button" onClick={() => setEditing(true)}>Edit team & manager</button>}
      </section>
      <p>Overall is the average of Mechanics, Game Sense, Teamwork and Leadership. Morale and Fatigue are temporary condition values.</p>
      <p>All ratings use a 0–100 scale. Higher Fatigue means more tired. Potential supports development.</p>
      <div className="player-grid">
        {game.players.map((player) => (
          <article className="management-card" key={player.id}>
            <p className="eyebrow">{player.role}{player.id === captain.id ? ' · Captain' : ''}</p>
            <h2>{player.name}</h2>
            {player.fullName && <p className="player-full-name">{player.fullName}</p>}
            <p>{player.roleFocus} · {player.playstyle}</p>
            <dl className="stat-list">
              <div><dt>Overall</dt><dd>{getOverallRating(player)}</dd></div>
              <div><dt>Mechanics</dt><dd>{player.mechanics}</dd></div>
              <div><dt>Game Sense</dt><dd>{player.gameSense}</dd></div>
              <div><dt>Teamwork</dt><dd>{player.teamwork}</dd></div>
              <div><dt>Leadership</dt><dd>{player.leadership}</dd></div>
              <div><dt>Morale</dt><dd>{player.morale}</dd></div>
              <div><dt>Fatigue</dt><dd>{player.fatigue}</dd></div>
              <div><dt>Potential</dt><dd>{player.potential}</dd></div>
              <div><dt>Matches Played</dt><dd>{player.matchesPlayed}</dd></div>
            </dl>
            <p><strong>Preferred champions:</strong> {player.preferredChampionIds.map((id) => champions.find((champion) => champion.id === id)?.name ?? id).join(', ')}</p>
          </article>
        ))}
      </div>
    </ManagementLayout>
  )
}
