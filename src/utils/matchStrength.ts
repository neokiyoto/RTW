import { champions } from '../data/champions.ts'
import { strategies } from '../data/strategies.ts'
import { matchEncounters } from '../data/matchEncounters.ts'
import type { Champion, MatchPhase, Opponent, Player, Strategy } from '../types/domain.ts'
import type { GameState } from '../types/gameState.ts'
import type { EncounterType } from '../types/match.ts'

export const clampMatch = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value))
export const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length

export function championCompatibility(player: Player, champion: Champion, strategy: Strategy): number {
  return (player.preferredChampionIds.includes(champion.id) ? 2 : 0)
    + (player.roleFocus === champion.archetype ? 1.5 : 0)
    + (player.role === champion.primaryRole ? 1 : 0)
    + (strategy.supportingFocuses.includes(champion.archetype) ? 1 : 0)
    + (player.playstyle === 'Aggressive' && champion.earlyGame >= 70 ? 1 : 0)
    + (player.playstyle === 'Patient' && champion.lateGame >= 70 ? 1 : 0)
    - Math.max(0, champion.difficulty - player.mechanics) / 20
}

export function playerStrength(player: Player, champion: Champion, strategy: Strategy, phase: MatchPhase): number {
  const rating = phase === 'Early game' ? champion.earlyGame : phase === 'Mid game' ? champion.teamFighting : champion.lateGame
  const style = player.playstyle === 'Aggressive' ? (phase === 'Early game' ? 2 : -1)
    : player.playstyle === 'Patient' ? (phase === 'Late game' ? 2 : -1) : 0
  return player.mechanics * 0.35 + player.gameSense * 0.3 + player.teamwork * 0.25 + player.leadership * 0.1
    + (player.morale - 50) * 0.08 - player.fatigue * 0.12
    + (rating - 50) * 0.1 + championCompatibility(player, champion, strategy) + style
}

export function strategyBonus(id: Strategy['id'], phase: MatchPhase): number {
  const index = phase === 'Early game' ? 0 : phase === 'Mid game' ? 1 : 2
  const bonuses = {
    'early-aggression': [6, 1, -3], 'objective-control': [0, 4, 1],
    'late-game-scaling': [-4, 0, 6], 'protect-the-carry': [-2, 2, 4],
  }
  return bonuses[id][index]
}

export function phaseStrength(game: GameState, opponent: Opponent, phase: MatchPhase): { team: number; opponent: number } {
  const strategy = strategies.find((entry) => entry.id === game.selectedStrategyId)!
  const strengths = game.players.map((player) => playerStrength(player, champions.find((champion) => champion.id === game.championAssignments[player.role])!, strategy, phase))
  let team = mean(strengths)
  if (strategy.id === 'protect-the-carry') team = team * 0.8 + strengths[game.players.findIndex((player) => player.role === 'Carry')] * 0.2
  team += (game.teamSynergy - 50) * 0.1 + strategyBonus(strategy.id, phase)
  const analysed = game.opponentKnowledge === 3
  let enemy = opponent.overallStrength + strategyBonus(opponent.preferredStrategyId, phase)
    + (opponent.strongPhase === phase ? 4 : 0) - (opponent.weakPhase === phase ? 4 : 0) + (analysed ? 0 : 2)
  if (analysed && opponent.weakPhase === phase) enemy -= 2
  if (opponent.id === 'crosswind-parallax') enemy += phase === 'Mid game' ? 2 : -1
  return { team, opponent: enemy }
}

export function encounterSkill(player: Player, champion: Champion, type: EncounterType): number {
  const tactical = ['rotation', 'objective', 'recovery', 'protection'].includes(type)
  const ability = tactical ? player.gameSense * 0.6 + player.teamwork * 0.4 : player.mechanics * 0.7 + player.gameSense * 0.3
  const fit = matchEncounters[type].focuses
  return (ability - 65) * 0.15 + (fit.includes(player.roleFocus) ? 1 : 0)
    + (fit.includes(champion.archetype) ? 1.5 : 0)
    + (['objective', 'protection', 'teamfight', 'final'].includes(type) ? (champion.teamFighting - 65) * 0.04 : 0)
}
