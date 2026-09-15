import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { GameSession } from '../hooks/useGame'
import { BrandMark } from '../components/BrandMark'
import { TeamProfileForm } from '../components/TeamProfileForm'
import { getTeamProfile, type TeamProfile } from '../utils/teamProfile'
import '../styles/home.css'

const foundationItems = [
  {
    title: 'Prepare your players',
    description: 'Choose a weekly activity to develop the roster, recover condition or study your opponent.',
  },
  {
    title: 'Make your match plan',
    description: 'Assign champions and choose a strategy that suits your five players.',
  },
  {
    title: 'Watch it unfold',
    description: 'Follow the play-by-play, see the lead change and guide your team through six matches.',
  },
]

export function HomePage({ session }: { session: GameSession }) {
  const navigate = useNavigate()
  const [pendingAction, setPendingAction] = useState<'start' | 'reset' | null>(null)

  function requestStart() {
    setPendingAction('start')
  }

  function startGame(profile: TeamProfile) {
    session.startGame(profile)
    navigate('/dashboard')
  }

  function continueGame() {
    if (session.continueGame()) navigate('/dashboard')
  }

  function confirmAction() {
    if (pendingAction === 'reset') session.resetGame()
    setPendingAction(null)
  }

  return (
    <div className="home-page">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Road to Worlds home">
          <BrandMark />
          <span>Road to Worlds</span>
        </Link>
        <span className="phase-badge">Single player / Season 01</span>
      </header>

      <main>
        <section className="hero" aria-labelledby="home-title">
          <p className="eyebrow">Text-based esports management</p>
          <h1 id="home-title">Your team.<br /><span>Your call.</span></h1>
          <p className="hero-copy">
            Coach five players through a six-match season. Build their confidence, choose your champions and watch your decisions play out.
          </p>

          <div className="hero-actions" aria-label="Game actions">
            <button type="button" className={session.canContinue ? 'secondary-button' : 'primary-button'} onClick={requestStart} disabled={pendingAction !== null}>
              Start new game
            </button>
            <button type="button" className={session.canContinue ? 'primary-button' : 'secondary-button'} onClick={continueGame} disabled={!session.canContinue || pendingAction !== null}>
              Continue
            </button>
            {session.game && (
              <button type="button" className="secondary-button" onClick={session.saveCurrentGame} disabled={pendingAction !== null}>Save game</button>
            )}
            {(session.game || session.hasSave) && (
              <button type="button" className="secondary-button" onClick={() => setPendingAction('reset')} disabled={pendingAction !== null}>Reset game</button>
            )}
          </div>
          {pendingAction === 'start' && <section className="save-confirmation" aria-labelledby="setup-title"><p className="eyebrow">New career</p><h2 id="setup-title">Put your name on it.</h2>
            {(session.game || session.hasSave) && <p>This will replace your current game and its browser save. Continue your game instead to keep your progress.</p>}
            <TeamProfileForm initial={{ teamName: '', managerName: '' }} submitLabel={session.game || session.hasSave ? 'Replace save & start career' : 'Start career'} onSave={startGame} onCancel={() => setPendingAction(null)} />
          </section>}
          {pendingAction === 'reset' && (
            <div className="save-confirmation" role="group" aria-label="Confirm game replacement or reset">
              <p>Reset the game? This removes your current game and the save in this browser.</p>
              <div className="hero-actions">
                <button type="button" className="primary-button" onClick={confirmAction}>Confirm reset</button>
                <button type="button" className="secondary-button" onClick={() => setPendingAction(null)}>Cancel</button>
              </div>
            </div>
          )}
          <p className="save-message" role="status">{session.message}</p>
          {session.game && (
            <section className="season-summary" aria-labelledby="season-title">
              <h2 id="season-title">{getTeamProfile(session.game).teamName}</h2>
              <p>Manager / {getTeamProfile(session.game).managerName}</p>
              <p>Week {session.game.week} of {session.game.seasonLength} · {session.game.players.length} players · {session.game.wins} wins · {session.game.losses} losses</p>
              <p><Link to="/dashboard">Open dashboard</Link> · <Link to="/team">View team</Link></p>
            </section>
          )}
        </section>

        <section className="foundation" aria-labelledby="foundation-title">
          <div className="section-heading">
            <p className="eyebrow">Your weekly game plan</p>
            <h2 id="foundation-title">The road to match day</h2>
          </div>

          <div className="foundation-grid">
            {foundationItems.map((item, index) => (
              <article className="foundation-card" key={item.title}>
                <span className="card-number">0{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>Road to Worlds / Esports management</span>
        <span>Five players. Six matches. Your season.</span>
      </footer>
    </div>
  )
}
