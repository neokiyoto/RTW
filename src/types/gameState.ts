import type { Player, Role, StrategyId } from './domain.ts'
import type { WeeklyActivity, WeeklyReport, WeeklyRolls } from './management.ts'
import type { MatchReport, MatchRolls } from './match.ts'
import type { TeamProfile } from './domain.ts'

export type ChampionAssignments = Record<Role, string | null>
export type PlayedMatch = { week: number; opponentId: string; result: 'victory' | 'defeat'; margin: number }

// Week advancement and match consequences belong to Phase 7.
export type GameState = {
  profile?: TeamProfile
  identitySeed?: number
  players: Player[]
  week: number
  seasonLength: number
  wins: number
  losses: number
  fans: number
  teamSynergy: number
  selectedWeeklyActivity: WeeklyActivity | null
  weeklyReport: WeeklyReport | null
  opponentKnowledge: 0 | 3
  selectedStrategyId: StrategyId | null
  championAssignments: ChampionAssignments
  matchHistory: PlayedMatch[]
  currentMatch: MatchReport | null
  seasonStatus: 'active' | 'complete'
}

export type GameAction =
  | { type: 'START_GAME'; identitySeed?: number; profile?: TeamProfile }
  | { type: 'UPDATE_TEAM_PROFILE'; profile: TeamProfile }
  | { type: 'LOAD_SAVE'; game: GameState }
  | { type: 'RESET_GAME' }
  | { type: 'RESOLVE_WEEKLY_ACTIVITY'; choice: WeeklyActivity; rolls: WeeklyRolls }
  | { type: 'ASSIGN_CHAMPION'; role: Role; championId: string | null }
  | { type: 'SELECT_STRATEGY'; strategyId: StrategyId | null }
  | { type: 'PLAY_MATCH'; rolls: MatchRolls }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'START_NEW_SEASON' }
