import { useEffect, useRef, useState } from 'react'
import { champions } from '../data/champions'
import type { MatchReport } from '../types/match'
import type { GameState } from '../types/gameState'
import { getOpponentWithPlayers } from '../utils/season'
import { matchTime, splitCommentary } from '../utils/matchPresentation'
import type { HighlightToken } from '../utils/matchPresentation'
import { GoldLeadChart } from './GoldLeadChart'
import { getTeamProfile } from '../utils/teamProfile'
import '../styles/match.css'

export function MatchReportView({ game, report, onAdvance }: { game: GameState; report: MatchReport; onAdvance: () => void }) {
  const [visible, setVisible] = useState(0)
  const [paused, setPaused] = useState(false)
  const [interval, setInterval] = useState(1800)
  const [follow, setFollow] = useState(true)
  const feed = useRef<HTMLOListElement>(null)
  const complete = visible >= report.events.length
  const current = report.events[visible - 1]
  const opponent = getOpponentWithPlayers(game, report.opponentId)
  const tokens: HighlightToken[] = [
    ...game.players.map((player) => ({ text: player.name, kind: 'player' as const })),
    ...[opponent.name, opponent.notablePlayer.name, ...opponent.roster.map((player) => player.name)].map((text) => ({ text, kind: 'opponent' as const })),
    ...champions.map((champion) => ({ text: champion.name, kind: 'champion' as const })),
    ...['objective', 'retreat', 'final push', 'final engagement', 'wins the fight', 'fought its way back in front', 'advantage has slipped', 'lead is lost', 'outmanoeuvres', 'secures', 'closes the match'].map((text) => ({ text, kind: 'keyword' as const })),
  ]
  const advantage = current?.state?.advantage ?? current?.momentum ?? 0
  const position = Math.abs(advantage) < 5 ? 'The match is finely balanced' : advantage > 0 ? 'Your team has the upper hand' : `${opponent.name} has the upper hand`
  useEffect(() => {
    if (complete || paused) return
    const timer = window.setTimeout(() => setVisible((count) => Math.min(report.events.length, count + 1)), interval)
    return () => window.clearTimeout(timer)
  }, [visible, complete, paused, interval, report.events.length])
  useEffect(() => {
    if (follow && feed.current) feed.current.scrollTop = feed.current.scrollHeight
  }, [visible, follow])

  return (
    <section className="management-card match-view" aria-labelledby="report-title">
      <header className="match-heading">
        <div><p className="eyebrow">{complete ? 'Full time' : paused ? 'Playback paused' : 'Match in progress'}</p><h2 id="report-title">{getTeamProfile(game).teamName} vs {opponent.name}</h2></div>
        <p className="match-clock">{matchTime(current?.seconds ?? (current?.minute ?? 0) * 60)}<span>{current?.state?.phase ?? (visible ? 'Match commentary' : 'Teams taking position')}</span></p>
      </header>
      <p className="match-position" role="status">{visible ? position : 'Both teams are ready for the opening exchange.'}</p>
      {current?.state && <p className="match-territory">{Math.abs(current.state.mapControl) < 4 ? 'Map contested' : current.state.mapControl > 0 ? 'Your team controls more of the map' : 'Opposition controls more of the map'} · {current.state.objective === 'contested' ? 'Objective being contested' : current.state.objective === 'team' ? 'Last objective: your team' : current.state.objective === 'opponent' ? 'Last objective: opposition' : 'Next objective available'}</p>}
      <GoldLeadChart events={report.events.slice(0, visible)} />
      <p className="commentary-key"><span className="highlight-player">Your players</span> · <span className="highlight-opponent">Opposition</span> · <span className="highlight-champion">Champions</span> · <strong>Key moments</strong></p>
      <div className="match-controls">
        {!complete && <>
          <button className="secondary-button" onClick={() => setPaused(!paused)}>{paused ? 'Resume' : 'Pause'}</button>
          <label htmlFor="match-pace">Pace</label><select id="match-pace" value={interval} onChange={(event) => setInterval(Number(event.target.value))}><option value={3000}>Relaxed</option><option value={1800}>Normal</option><option value={700}>Fast</option></select>
          <button className="secondary-button" onClick={() => setVisible(report.events.length)}>Show full report</button>
        </>}
        <label><input type="checkbox" checked={follow} onChange={(event) => setFollow(event.target.checked)} /> Follow latest action</label>
      </div>
      <ol className="match-feed" ref={feed} tabIndex={0} aria-label="Match commentary" aria-live="off">
        {report.events.slice(0, visible).map((event, index) => <li key={index} className={`match-entry match-entry-${event.kind}`}>
          <time>{matchTime(event.seconds ?? event.minute * 60)}</time><p>{splitCommentary(event.text, tokens).map((part, partIndex) => part.kind ? <strong key={partIndex} className={`highlight-${part.kind}`}>{part.text}</strong> : part.text)}</p>
        </li>)}
        {visible === 0 && <li className="match-waiting">The teams move onto the map…</li>}
      </ol>
      <p className="match-announcement" aria-live="polite" aria-atomic="true">{current ? `${matchTime(current.seconds ?? current.minute * 60)}. ${current.text}` : 'Waiting for the opening play.'}</p>
      {complete && <div className="match-result" role="status"><h3>{report.result === 'victory' ? 'Victory' : 'Defeat'}</h3><p>The final engagement settles the match. Apply the result to update your team and continue the season.</p><button className="primary-button" onClick={onAdvance}>Apply result and advance</button></div>}
      <p className="match-save-note">Returning here replays the same contest. Check the save status above before leaving the game.</p>
    </section>
  )
}
