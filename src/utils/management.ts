import { activities } from '../data/activities.ts'
import { weeklyEvents } from '../data/weeklyEvents.ts'
import type { Player } from '../types/domain.ts'
import type { GameState } from '../types/gameState.ts'
import type { WeeklyActivity, WeeklyReport, WeeklyRolls } from '../types/management.ts'

const TEAM_TRAINING_GAIN = 1
const TEAM_TRAINING_FATIGUE = 8
const TEAM_TRAINING_SYNERGY = 4
const INDIVIDUAL_TRAINING_FATIGUE = 12
const REST_RECOVERY = 15
const REST_MORALE = 3
const TEAM_BUILDING_MORALE = 6
const TEAM_BUILDING_SYNERGY = 5
const EVENT_CONDITION_CHANGE = 3
const EVENT_SYNERGY_CHANGE = 2

export function clampRating(value: number): number {
  return Math.max(0, Math.min(100, value))
}

export function getOverallRating(player: Player): number {
  return Math.round((player.mechanics + player.gameSense + player.teamwork + player.leadership) / 4)
}

export function getDevelopmentChance(potential: number, ability: number): number {
  return Math.max(0.1, Math.min(0.9, (potential + 100 - ability) / 200))
}

function describeChanges(before: GameState, after: GameState): string[] {
  const changes: string[] = []
  const stats = [
    ['mechanics', 'Mechanics'], ['gameSense', 'Game Sense'], ['teamwork', 'Teamwork'],
    ['morale', 'Morale'], ['fatigue', 'Fatigue'],
  ] as const
  for (const player of after.players) {
    const previous = before.players.find((entry) => entry.id === player.id)!
    const differences: string[] = []
    for (const [key, label] of stats) {
      const delta = player[key] - previous[key]
      if (delta !== 0) differences.push(`${label} ${delta > 0 ? '+' : ''}${delta}`)
    }
    if (differences.length > 0) changes.push(`${player.name}: ${differences.join(', ')}.`)
  }
  const synergyChange = after.teamSynergy - before.teamSynergy
  if (synergyChange !== 0) changes.push(`Team synergy ${synergyChange > 0 ? '+' : ''}${synergyChange}.`)
  if (after.opponentKnowledge > before.opponentKnowledge) changes.push('The next opponent’s full tactical profile is now available.')
  if (changes.length === 0) changes.push('No values changed; affected ratings were already at their limits.')
  return changes
}

export function resolveWeeklyActivity(game: GameState, choice: WeeklyActivity, rolls: WeeklyRolls): GameState {
  if (game.selectedWeeklyActivity !== null || game.weeklyReport !== null) return game
  if (![rolls.development, rolls.event, rolls.player].every((roll) => Number.isFinite(roll) && roll >= 0 && roll < 1)) return game
  const activity = activities.find((entry) => entry.id === choice.id)
  if (!activity) return game
  if (choice.id === 'individual-training'
    && (!game.players.some((player) => player.id === choice.playerId)
      || !['mechanics', 'gameSense'].includes(choice.attribute))) return game

  const next = structuredClone(game)
  let activitySummary = `${activity.name} completed.`
  switch (choice.id) {
    case 'team-training':
      for (const player of next.players) {
        player.teamwork = clampRating(player.teamwork + TEAM_TRAINING_GAIN)
        player.fatigue = clampRating(player.fatigue + TEAM_TRAINING_FATIGUE)
      }
      next.teamSynergy = clampRating(next.teamSynergy + TEAM_TRAINING_SYNERGY)
      break
    case 'individual-training': {
      const player = next.players.find((entry) => entry.id === choice.playerId)!
      const attributeName = choice.attribute === 'mechanics' ? 'Mechanics' : 'Game Sense'
      const improves = player[choice.attribute] < 100
        && rolls.development < getDevelopmentChance(player.potential, player[choice.attribute])
      player.fatigue = clampRating(player.fatigue + INDIVIDUAL_TRAINING_FATIGUE)
      if (improves) player[choice.attribute] += 1
      activitySummary = `${player.name} trained ${attributeName}. ${improves ? 'The focused practice produced a one-point improvement.' : 'There was no ability improvement this time.'}`
      break
    }
    case 'opponent-analysis':
      next.opponentKnowledge = 3
      break
    case 'rest':
      for (const player of next.players) {
        player.fatigue = clampRating(player.fatigue - REST_RECOVERY)
        player.morale = clampRating(player.morale + REST_MORALE)
      }
      break
    case 'team-building':
      for (const player of next.players) player.morale = clampRating(player.morale + TEAM_BUILDING_MORALE)
      next.teamSynergy = clampRating(next.teamSynergy + TEAM_BUILDING_SYNERGY)
      break
  }

  const eventDefinition = weeklyEvents[Math.floor(rolls.event * weeklyEvents.length)]
  const player = next.players[Math.floor(rolls.player * next.players.length)]
  let event: WeeklyReport['event']
  switch (eventDefinition.id) {
    case 'practice-confidence':
      player.morale = clampRating(player.morale + EVENT_CONDITION_CHANGE)
      event = { id: eventDefinition.id, playerId: player.id, summary: `${player.name} finds reassurance in a good practice session.` }
      break
    case 'long-review':
      player.fatigue = clampRating(player.fatigue + EVENT_CONDITION_CHANGE)
      event = { id: eventDefinition.id, playerId: player.id, summary: `${player.name} stays late to review practice and finishes a little more tired.` }
      break
    case 'shared-plan':
      next.teamSynergy = clampRating(next.teamSynergy + EVENT_SYNERGY_CHANGE)
      event = { id: eventDefinition.id, playerId: null, summary: 'A short team discussion clears up conflicting calls and brings the players closer together.' }
      break
  }

  next.selectedWeeklyActivity = structuredClone(choice)
  next.weeklyReport = { activitySummary, event, changes: describeChanges(game, next) }
  return next
}
