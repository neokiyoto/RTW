import { initialRoster } from '../data/players.ts'
import type { Player } from '../types/domain.ts'
import type { ChampionAssignments, GameState, PlayedMatch } from '../types/gameState.ts'
import type { WeeklyActivity, WeeklyReport } from '../types/management.ts'
import { weeklyEvents } from '../data/weeklyEvents.ts'
import { strategies } from '../data/strategies.ts'
import { createEmptyAssignments, getAssignmentErrors, ROLES } from './matchPreparation.ts'
import { simulateMatch, validMatchRolls } from './simulateMatch.ts'
import { legacySimulateMatch } from './legacySimulateMatch.ts'
import { seasonSchedule } from './season.ts'
import { createPlayerIdentities } from './playerIdentities.ts'
import { isValidProfile } from './teamProfile.ts'

export const SAVE_VERSION = 1

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function isRating(value: unknown): value is number {
  return isNonNegativeInteger(value) && value <= 100
}

function readPlayer(value: unknown, expectedRoster: Player[]): Player | null {
  if (!isRecord(value)) return null
  const original = expectedRoster.find((player) => player.id === value.id)
  if (!original) return null

  // Identity, role, focus, playstyle and preferences are permanent in this version.
  if (value.name !== original.name || value.fullName !== original.fullName || value.role !== original.role
    || value.roleFocus !== original.roleFocus || value.playstyle !== original.playstyle
    || !Array.isArray(value.preferredChampionIds) || value.preferredChampionIds.length !== 2
    || value.preferredChampionIds[0] !== original.preferredChampionIds[0]
    || value.preferredChampionIds[1] !== original.preferredChampionIds[1]) return null

  if (!isRating(value.mechanics) || !isRating(value.gameSense)
    || !isRating(value.teamwork) || !isRating(value.leadership)
    || !isRating(value.morale) || !isRating(value.fatigue) || !isRating(value.potential)
    || !isNonNegativeInteger(value.matchesPlayed)) return null

  // Rebuild known fields instead of trusting or spreading an external object.
  return {
    ...original,
    preferredChampionIds: [...original.preferredChampionIds],
    mechanics: value.mechanics,
    gameSense: value.gameSense,
    teamwork: value.teamwork,
    leadership: value.leadership,
    morale: value.morale,
    fatigue: value.fatigue,
    potential: value.potential,
    matchesPlayed: value.matchesPlayed,
  }
}

function readActivity(value: unknown): WeeklyActivity | null | undefined {
  if (value === null) return null
  if (!isRecord(value)) return undefined
  if (value.id === 'individual-training') {
    if (typeof value.playerId !== 'string' || !initialRoster.some((player) => player.id === value.playerId)
      || (value.attribute !== 'mechanics' && value.attribute !== 'gameSense')) return undefined
    return { id: value.id, playerId: value.playerId, attribute: value.attribute }
  }
  if (value.id === 'team-training' || value.id === 'opponent-analysis' || value.id === 'rest' || value.id === 'team-building') {
    return { id: value.id }
  }
  return undefined
}

function isReportText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 1000
}

function readWeeklyReport(value: unknown): WeeklyReport | null {
  if (!isRecord(value) || !isReportText(value.activitySummary) || !isRecord(value.event)
    || !isReportText(value.event.summary) || !Array.isArray(value.changes)
    || value.changes.length < 1 || value.changes.length > 8 || !value.changes.every(isReportText)) return null
  const event = value.event
  const definition = weeklyEvents.find((entry) => entry.id === event.id)
  if (!definition) return null
  if (definition.id === 'shared-plan') {
    if (event.playerId !== null) return null
  } else if (typeof event.playerId !== 'string' || !initialRoster.some((player) => player.id === event.playerId)) return null
  return {
    activitySummary: value.activitySummary,
    changes: [...value.changes],
    event: { id: definition.id, playerId: event.playerId as string | null, summary: event.summary as string },
  }
}

function readMatchHistory(value: unknown): PlayedMatch[] | null {
  if (!Array.isArray(value) || value.length > seasonSchedule.length) return null
  const history: PlayedMatch[] = []
  for (const [index, entry] of value.entries()) {
    if (!isRecord(entry) || entry.week !== index + 1 || entry.opponentId !== seasonSchedule[index].opponentId
      || (entry.result !== 'victory' && entry.result !== 'defeat')
      || typeof entry.margin !== 'number' || !Number.isFinite(entry.margin)) return null
    history.push({ week: entry.week, opponentId: entry.opponentId, result: entry.result, margin: entry.margin })
  }
  return history
}

export function validateSave(value: unknown): GameState | null {
  if (!isRecord(value) || value.version !== SAVE_VERSION || !isRecord(value.game)) return null
  const game = value.game
  if (game.profile !== undefined && !isValidProfile(game.profile)) return null
  if (game.identitySeed !== undefined && (!isNonNegativeInteger(game.identitySeed) || game.identitySeed > 4294967295)) return null
  const identitySeed = game.identitySeed as number | undefined
  const identities = identitySeed === undefined ? null : createPlayerIdentities(identitySeed)
  const expectedRoster = initialRoster.map((player, index) => ({ ...player, ...identities?.players[index] }))
  // Older version 1 saves have no assignments. Preserve their existing progress.
  const championAssignments: ChampionAssignments = createEmptyAssignments()
  if (game.championAssignments !== undefined) {
    if (!isRecord(game.championAssignments) || Object.keys(game.championAssignments).length !== ROLES.length) return null
    for (const role of ROLES) {
      const id = game.championAssignments[role]
      if (id !== null && typeof id !== 'string') return null
      championAssignments[role] = id
    }
    if (getAssignmentErrors(championAssignments).length > 0) return null
  }
  const strategy = strategies.find((entry) => entry.id === game.selectedStrategyId)
  if (game.selectedStrategyId !== null && !strategy) return null
  if (!Array.isArray(game.players) || game.players.length !== initialRoster.length) return null

  const players: Player[] = []
  for (const entry of game.players) {
    const player = readPlayer(entry, expectedRoster)
    if (!player || players.some((existing) => existing.id === player.id)) return null
    players.push(player)
  }

  const selectedWeeklyActivity = readActivity(game.selectedWeeklyActivity)
  if (selectedWeeklyActivity === undefined) return null
  let weeklyReport: WeeklyReport | null = null
  if (selectedWeeklyActivity === null) {
    // Phase 3 saves did not have a weeklyReport field. They migrate to null.
    if (game.weeklyReport !== undefined && game.weeklyReport !== null) return null
    if (game.opponentKnowledge !== 0) return null
  } else {
    weeklyReport = readWeeklyReport(game.weeklyReport)
    if (!weeklyReport || game.opponentKnowledge !== (selectedWeeklyActivity.id === 'opponent-analysis' ? 3 : 0)) return null
  }

  const matchHistory = readMatchHistory(game.matchHistory)
  if (!matchHistory || game.seasonLength !== seasonSchedule.length || !isNonNegativeInteger(game.wins)
    || !isNonNegativeInteger(game.losses) || game.wins + game.losses !== matchHistory.length
    || game.wins !== matchHistory.filter((match) => match.result === 'victory').length
    || !isNonNegativeInteger(game.fans) || !isRating(game.teamSynergy)
    || (game.seasonStatus !== 'active' && game.seasonStatus !== 'complete')) return null
  const seasonComplete = matchHistory.length === seasonSchedule.length
  if ((game.seasonStatus === 'complete') !== seasonComplete
    || game.week !== (seasonComplete ? seasonSchedule.length : matchHistory.length + 1)) return null

  const restored: GameState = {
    ...(isValidProfile(game.profile) ? { profile: { teamName: game.profile.teamName, managerName: game.profile.managerName } } : {}),
    ...(identitySeed === undefined ? {} : { identitySeed }),
    players,
    week: game.week,
    seasonLength: seasonSchedule.length,
    wins: game.wins,
    losses: game.losses,
    fans: game.fans,
    teamSynergy: game.teamSynergy,
    selectedWeeklyActivity,
    weeklyReport,
    opponentKnowledge: game.opponentKnowledge as 0 | 3,
    selectedStrategyId: strategy?.id ?? null,
    championAssignments,
    matchHistory,
    currentMatch: null,
    seasonStatus: game.seasonStatus,
  }
  // Older saves have no match. Recompute a present report to verify its outcome and commentary.
  if (game.currentMatch !== undefined && game.currentMatch !== null) {
    const match = game.currentMatch
    if (!isRecord(match) || !validMatchRolls(match.rolls)) return null
    if (match.engineVersion !== undefined && match.engineVersion !== 2) return null
    const expected = match.engineVersion === 2 ? simulateMatch(restored, match.rolls) : legacySimulateMatch(restored, match.rolls)
    if (!expected || match.opponentId !== expected.opponentId || match.result !== expected.result
      || match.margin !== expected.margin || JSON.stringify(match.events) !== JSON.stringify(expected.events)) return null
    if (seasonComplete) return null
    restored.currentMatch = expected
  }
  if (seasonComplete && (restored.currentMatch !== null || selectedWeeklyActivity !== null || weeklyReport !== null
    || strategy || Object.values(championAssignments).some((id) => id !== null))) return null
  return restored
}
