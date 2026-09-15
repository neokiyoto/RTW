import { Link } from 'react-router-dom'
import { ManagementLayout } from '../components/ManagementLayout'
import type { GameSession } from '../hooks/useGame'
import type { GameState } from '../types/gameState'
import { getSeasonResult, getStandings } from '../utils/season'

export function StandingsPage({ game, session }: { game: GameState; session: GameSession }) {
  const standings = getStandings(game)
  return (
    <ManagementLayout session={session} title="Season standings">
      <section className="management-card">
        <p>Week {game.week} of {game.seasonLength} · Your record: {game.wins} wins · {game.losses} losses</p>
        <div className="table-scroll"><table><caption>League table</caption><thead><tr><th scope="col">#</th><th scope="col">Team</th><th scope="col">Played</th><th scope="col">Wins</th><th scope="col">Losses</th></tr></thead><tbody>
          {standings.map((team, index) => <tr key={team.id} className={team.isPlayer ? 'player-standing' : undefined}><td>{index + 1}</td><th scope="row">{team.name}{team.isPlayer ? ' (You)' : ''}</th><td>{team.played}</td><td>{team.wins}</td><td>{team.losses}</td></tr>)}
        </tbody></table></div>
        <p>Each week also resolves one scheduled match between the other teams. The table includes every completed fixture.</p>
      </section>
      <section className="management-card">
        <h2>Match history</h2>
        {game.matchHistory.length === 0 ? <p>No completed matches yet.</p> : <ol>{game.matchHistory.map((match) => <li key={match.week}>Week {match.week}: {match.result === 'victory' ? 'Victory' : 'Defeat'} against {standings.find((team) => team.id === match.opponentId)?.name} (margin {Math.abs(Math.round(match.margin))})</li>)}</ol>}
      </section>
      {game.seasonStatus === 'complete' ? <section className="management-card"><h2>Season result</h2><p>{getSeasonResult(game)}</p><button className="primary-button" onClick={session.startNewSeason}>Start new season</button></section> : <p><Link to="/dashboard">Return to the dashboard</Link> to prepare week {game.week}.</p>}
    </ManagementLayout>
  )
}
