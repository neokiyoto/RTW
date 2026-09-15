import type { GameAction, GameState } from '../types/gameState.ts'
import { createInitialGame } from '../utils/createInitialGame.ts'
import { resolveWeeklyActivity } from '../utils/management.ts'
import { getAssignmentErrors, ROLES } from '../utils/matchPreparation.ts'
import { strategies } from '../data/strategies.ts'
import { simulateMatch } from '../utils/simulateMatch.ts'
import { INITIAL_TEAM_SYNERGY } from '../utils/createInitialGame.ts'
import { createEmptyAssignments } from '../utils/matchPreparation.ts'
import { isValidProfile } from '../utils/teamProfile.ts'

export function gameReducer(state: GameState | null, action: GameAction): GameState | null {
  switch (action.type) {
    case 'START_GAME':
      return createInitialGame(action.identitySeed, action.profile)
    case 'UPDATE_TEAM_PROFILE':
      return state && isValidProfile(action.profile) ? { ...state, profile: { ...action.profile } } : state
    case 'LOAD_SAVE':
      return structuredClone(action.game)
    case 'RESET_GAME':
      return null
    case 'RESOLVE_WEEKLY_ACTIVITY':
      return state && !state.currentMatch ? resolveWeeklyActivity(state, action.choice, action.rolls) : state
    case 'PLAY_MATCH': {
      if (!state || state.currentMatch || state.seasonStatus !== 'active') return state
      const currentMatch = simulateMatch(state, action.rolls)
      return currentMatch ? { ...state, currentMatch } : state
    }
    case 'ADVANCE_WEEK': {
      if (!state || !state.currentMatch || state.seasonStatus !== 'active') return state
      const won = state.currentMatch.result === 'victory'
      const players = state.players.map((player) => ({
        ...player,
        matchesPlayed: player.matchesPlayed + 1,
        fatigue: Math.min(100, player.fatigue + 8),
        morale: Math.max(0, Math.min(100, player.morale + (won ? 4 : -5))),
      }))
      const matchHistory = [...state.matchHistory, { week: state.week, opponentId: state.currentMatch.opponentId, result: state.currentMatch.result, margin: state.currentMatch.margin }]
      const seasonComplete = matchHistory.length === state.seasonLength
      return {
        ...state,
        players,
        wins: state.wins + (won ? 1 : 0),
        losses: state.losses + (won ? 0 : 1),
        fans: Math.max(0, state.fans + (won ? 15 : -5)),
        teamSynergy: Math.max(0, Math.min(100, state.teamSynergy + (won ? 2 : -1))),
        matchHistory,
        currentMatch: null,
        seasonStatus: seasonComplete ? 'complete' : 'active',
        week: seasonComplete ? state.week : state.week + 1,
        selectedWeeklyActivity: null,
        weeklyReport: null,
        opponentKnowledge: 0,
        selectedStrategyId: null,
        championAssignments: createEmptyAssignments(),
      }
    }
    case 'START_NEW_SEASON':
      if (!state || state.seasonStatus !== 'complete') return state
      return {
        ...state,
        players: state.players.map((player) => ({ ...player, morale: Math.max(70, player.morale), fatigue: Math.min(15, player.fatigue) })),
        week: 1,
        wins: 0,
        losses: 0,
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
    case 'ASSIGN_CHAMPION': {
      if (!state || state.seasonStatus !== 'active' || state.currentMatch || !ROLES.includes(action.role) || state.championAssignments[action.role] === action.championId) return state
      const championAssignments = { ...state.championAssignments, [action.role]: action.championId }
      if (getAssignmentErrors(championAssignments).length > 0) return state
      return { ...state, championAssignments }
    }
    case 'SELECT_STRATEGY':
      if (!state || state.seasonStatus !== 'active' || state.currentMatch || state.selectedStrategyId === action.strategyId) return state
      if (action.strategyId !== null && !strategies.some((strategy) => strategy.id === action.strategyId)) return state
      return { ...state, selectedStrategyId: action.strategyId }
    default:
      return state
  }
}
