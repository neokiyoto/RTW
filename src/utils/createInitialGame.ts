import { initialRoster } from '../data/players.ts'
import type { GameState } from '../types/gameState.ts'
import { createEmptyAssignments } from './matchPreparation.ts'
import { createPlayerIdentities } from './playerIdentities.ts'
import { isValidProfile, type TeamProfile } from './teamProfile.ts'

export const INITIAL_FANS = 100
export const INITIAL_TEAM_SYNERGY = 50

export function createInitialGame(identitySeed?: number, profile?: TeamProfile): GameState {
  const identities = identitySeed === undefined ? null : createPlayerIdentities(identitySeed)
  return {
    ...(isValidProfile(profile) ? { profile: { ...profile } } : {}),
    ...(identitySeed === undefined ? {} : { identitySeed }),
    players: structuredClone(initialRoster).map((player, index) => ({ ...player, ...identities?.players[index] })),
    week: 1,
    seasonLength: 6,
    wins: 0,
    losses: 0,
    fans: INITIAL_FANS,
    teamSynergy: INITIAL_TEAM_SYNERGY,
    selectedWeeklyActivity: null,
    weeklyReport: null,
    opponentKnowledge: 0,
    selectedStrategyId: null,
    championAssignments: createEmptyAssignments(),
    matchHistory: [],
    currentMatch: null,
    seasonStatus: 'active',
  }
}
