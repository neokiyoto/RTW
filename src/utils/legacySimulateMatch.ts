import { champions } from '../data/champions.ts'
import { strategies } from '../data/strategies.ts'
import type { Champion, MatchPhase, Opponent, Player, Strategy } from '../types/domain.ts'
import type { GameState } from '../types/gameState.ts'
import type { MatchReport, MatchRolls } from '../types/match.ts'
import { getMatchReadinessErrors } from './matchPreparation.ts'
import { getCurrentOpponent } from './season.ts'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length
const round = (value: number) => Math.round(value * 100) / 100
const stages: { name: string; phase: MatchPhase; minute: number }[] = [
  { name: 'Opening lanes', phase: 'Early game', minute: 5 },
  { name: 'Mid-game rotations', phase: 'Mid game', minute: 12 },
  { name: 'Major objective', phase: 'Mid game', minute: 18 },
  { name: 'Late-game setup', phase: 'Late game', minute: 25 },
  { name: 'Final engagement', phase: 'Late game', minute: 32 },
]

export function validMatchRolls(value: unknown): value is MatchRolls {
  if (typeof value !== 'object' || value === null) return false
  return ['timing', 'player', 'outcome'].every((key) => {
    const roll = (value as Record<string, unknown>)[key]
    return typeof roll === 'number' && Number.isFinite(roll) && roll >= 0 && roll < 1
  })
}

export function championCompatibility(player: Player, champion: Champion, strategy: Strategy): number {
  return (player.preferredChampionIds.includes(champion.id) ? 2 : 0)
    + (player.roleFocus === champion.archetype ? 1 : 0)
    + (player.role === champion.primaryRole ? 1 : 0)
    + (strategy.supportingFocuses.includes(champion.archetype) ? 1 : 0)
    + (player.playstyle === 'Aggressive' && champion.earlyGame >= 70 ? 1 : 0)
    + (player.playstyle === 'Patient' && champion.lateGame >= 70 ? 1 : 0)
    - Math.max(0, champion.difficulty - player.mechanics) / 25
}

function strategyBonus(id: Strategy['id'], phase: MatchPhase): number {
  const index = phase === 'Early game' ? 0 : phase === 'Mid game' ? 1 : 2
  const bonuses = {
    'early-aggression': [6, 1, -3],
    'objective-control': [0, 5, 1],
    'late-game-scaling': [-4, 1, 6],
    'protect-the-carry': [-2, 2, 4],
  }
  return bonuses[id][index]
}

export function phaseStrength(game: GameState, opponent: Opponent, phase: MatchPhase): { team: number; opponent: number } {
  const strategy = strategies.find((entry) => entry.id === game.selectedStrategyId)!
  const performances = game.players.map((player) => {
    const champion = champions.find((entry) => entry.id === game.championAssignments[player.role])!
    const ability = player.mechanics * 0.35 + player.gameSense * 0.3 + player.teamwork * 0.25 + player.leadership * 0.1
    const rating = phase === 'Early game' ? champion.earlyGame : phase === 'Mid game' ? champion.teamFighting : champion.lateGame
    const style = player.playstyle === 'Aggressive' ? (phase === 'Early game' ? 2 : -1)
      : player.playstyle === 'Patient' ? (phase === 'Late game' ? 2 : -1) : 0
    const performance = ability + (player.morale - 50) * 0.08 - player.fatigue * 0.12
      + (rating - 50) * 0.08 + championCompatibility(player, champion, strategy) + style
      + (strategy.supportingFocuses.includes(player.roleFocus) ? 1 : 0)
    return { role: player.role, performance }
  })
  // Protect the Carry depends more on the carry's actual ability and condition.
  const carry = performances.find((entry) => entry.role === 'Carry')!.performance
  let team = average(performances.map((entry) => entry.performance))
  if (strategy.id === 'protect-the-carry') team = team * 0.8 + carry * 0.2
  team += (game.teamSynergy - 50) * 0.1 + strategyBonus(strategy.id, phase)
  const analysed = game.opponentKnowledge === 3
  let enemy = opponent.overallStrength + strategyBonus(opponent.preferredStrategyId, phase)
    + (opponent.strongPhase === phase ? 4 : 0) - (opponent.weakPhase === phase ? 4 : 0)
    + (analysed ? 0 : 2)
  if (analysed && opponent.weakPhase === phase) enemy -= 2
  // Crosswind adapts its point of pressure to the player's plan rather than protecting a fixed carry.
  if (opponent.id === 'crosswind-parallax') {
    enemy -= strategyBonus(opponent.preferredStrategyId, phase)
    enemy += phase === 'Mid game' ? (strategy.id === 'early-aggression' ? 5 : 3) : 0
  }
  return { team: round(team), opponent: round(enemy) }
}

// Frozen V1 implementation: only used to validate and replay existing saved reports.
export function legacySimulateMatch(game: GameState, rolls: MatchRolls, opponent: Opponent = getCurrentOpponent(game)): MatchReport | null {
  if (getMatchReadinessErrors(game).length || !validMatchRolls(rolls)) return null
  const strategy = strategies.find((entry) => entry.id === game.selectedStrategyId)!
  const player = game.players[Math.floor(rolls.player * game.players.length)]
  const champion = champions.find((entry) => entry.id === game.championAssignments[player.role])!
  const captain = Math.max(...game.players.map((entry) => entry.leadership))
  const experience = Math.min(player.matchesPlayed, 100) / 100
  const chance = clamp(0.5 + (player.gameSense - 50) * 0.002 + (player.teamwork - 50) * 0.001
    + (captain - 50) * 0.001 + (player.morale - 50) * 0.002 - player.fatigue * 0.002
    + (game.teamSynergy - 50) * 0.001 + championCompatibility(player, champion, strategy) * 0.01
    + (game.opponentKnowledge === 3 ? 0.08 : 0) + (player.playstyle === 'Patient' ? 0.04 : player.playstyle === 'Aggressive' ? -0.04 : 0), 0.2, 0.8)
  const positive = rolls.outcome < chance
  // One event changes the cumulative margin by at most six points; experience softens mistakes.
  const impact = (player.playstyle === 'Aggressive' ? 6 : player.playstyle === 'Patient' ? 4 : 5) - (positive ? 0 : experience)
  const eventStage = [0, 1, 3][Math.floor(rolls.timing * 3)]
  const events: MatchReport['events'] = []
  let momentum = 0
  for (const [index, stage] of stages.entries()) {
    const strength = phaseStrength(game, opponent, stage.phase)
    const edge = strength.team - strength.opponent
    momentum = round(momentum + edge)
    const stageText = edge >= 0 ? `Your team gains ground with ${strategy.name.toLowerCase()}.` : `${opponent.name} wins this exchange and forces your team back.`
    const position = momentum > 0 ? 'Your team holds the advantage.' : momentum < 0 ? `${opponent.name} holds the advantage.` : 'The teams remain level.'
    events.push({ minute: stage.minute, kind: 'phase', momentum, text: `${stage.name}: ${stageText} ${position}` })
    if (index === eventStage) {
      momentum = round(momentum + (positive ? impact : -impact))
      const detail = positive
        ? `${player.name} on ${champion.name} reads an opening and coordinates a successful move, recovering space for your team.`
        : `${player.name} on ${champion.name} commits before the team is set; ${opponent.name} punishes the gap.`
      events.push({ minute: stage.minute + 2, kind: 'turning-point', momentum, text: `${detail} Momentum shifts ${positive ? 'towards your team' : 'towards the opposition'}.` })
    }
  }
  // A level final position favours the defending opponent; there is no extra random tie-break.
  return { opponentId: opponent.id, rolls: { ...rolls }, events, result: momentum > 0 ? 'victory' : 'defeat', margin: momentum }
}
