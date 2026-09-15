import type { MatchEvent } from '../types/match'
import { estimatedGoldLead, matchTime } from '../utils/matchPresentation'

export function GoldLeadChart({ events }: { events: MatchEvent[] }) {
  const points = [{ seconds: 0, gold: 0 }, ...events.map((event) => ({ seconds: event.seconds ?? event.minute * 60, gold: estimatedGoldLead(event) }))]
  const last = points[points.length - 1]
  const limit = Math.max(2000, Math.ceil(Math.max(...points.map((point) => Math.abs(point.gold))) / 2000) * 2000)
  const end = Math.max(60, last.seconds)
  const x = (seconds: number) => 65 + seconds / end * 490
  const y = (gold: number) => 100 - gold / limit * 65
  const lead = last.gold === 0 ? 'Even' : `${last.gold > 0 ? 'Your team' : 'Opposition'} +${Math.abs(last.gold).toLocaleString('en-GB')}`
  return <figure className="gold-chart" aria-label="Estimated gold lead over revealed match time">
    <figcaption><strong>Estimated gold lead</strong><span>{lead}</span></figcaption>
    <svg viewBox="0 0 580 205" role="img" aria-label={`Estimated gold lead at ${matchTime(last.seconds)}: ${lead}. Above zero favours your team; below zero favours the opposition.`}>
      {[limit, 0, -limit].map((gold) => <g key={gold}><line x1="65" x2="555" y1={y(gold)} y2={y(gold)} className={gold === 0 ? 'gold-zero' : 'gold-grid'} /><text x="55" y={y(gold) + 4} textAnchor="end">{gold > 0 ? '+' : ''}{gold / 1000}k</text></g>)}
      <text x="65" y="19">Your team ahead</text><text x="65" y="190">Opposition ahead</text>
      <polyline points={points.map((point) => `${x(point.seconds)},${y(point.gold)}`).join(' ')} fill="none" className="gold-line" />
      <circle cx={x(last.seconds)} cy={y(last.gold)} r="4" className="gold-dot" />
      <text x="555" y="190" textAnchor="end">{matchTime(last.seconds)}</text>
    </svg>
    <p>Estimated from match advantage. The line follows the action as it is revealed.</p>
    {events.length > 0 && <details><summary>View gold-lead values</summary><ul className="gold-values">{points.map((point, index) => <li key={index}>{matchTime(point.seconds)}: {point.gold > 0 ? '+' : ''}{point.gold.toLocaleString('en-GB')}</li>)}</ul></details>}
  </figure>
}
