import { useReducer, useRef, useState } from 'react'
import { gameReducer } from '../reducers/gameReducer.ts'
import type { GameAction, GameState } from '../types/gameState.ts'
import type { Role, StrategyId } from '../types/domain.ts'
import type { WeeklyActivity } from '../types/management.ts'
import { createInitialGame } from '../utils/createInitialGame.ts'
import { loadSave, removeSave, saveGame } from '../utils/saveStorage.ts'
import type { TeamProfile } from '../utils/teamProfile.ts'

export function useGame() {
  const [game, dispatch] = useReducer(gameReducer, null)
  // Keep action handlers current even when two clicks arrive before a render.
  const currentGame = useRef<GameState | null>(null)
  const [saved, setSaved] = useState(() => loadSave())
  const [message, setMessage] = useState(saved.message)

  function persist(nextGame: GameState) {
    const result = saveGame(nextGame)
    setSaved(loadSave())
    setMessage(result.message)
  }

  function startGame(profile: TeamProfile) {
    const identitySeed = crypto.getRandomValues(new Uint32Array(1))[0]
    const nextGame = createInitialGame(identitySeed, profile)
    currentGame.current = nextGame
    dispatch({ type: 'START_GAME', identitySeed, profile })
    persist(nextGame)
  }

  function continueGame() {
    if (currentGame.current) return true
    // Read again so Continue never loads a stale snapshot from another tab.
    const result = loadSave()
    setSaved(result)
    if (result.game) {
      currentGame.current = result.game
      dispatch({ type: 'LOAD_SAVE', game: result.game })
      setMessage('Saved game loaded.')
      return true
    } else {
      setMessage(result.message)
      return false
    }
  }

  function resetGame() {
    const result = removeSave()
    if (result.success) {
      currentGame.current = null
      dispatch({ type: 'RESET_GAME' })
      setSaved({ status: 'missing', game: null, message: result.message })
    }
    setMessage(result.message)
  }

  function resolveActivity(choice: WeeklyActivity) {
    const current = currentGame.current
    if (!current || current.selectedWeeklyActivity !== null) return
    const action = {
      type: 'RESOLVE_WEEKLY_ACTIVITY' as const,
      choice,
      rolls: { development: Math.random(), event: Math.random(), player: Math.random() },
    }
    applyAction(action)
  }

  function applyAction(action: GameAction) {
    const current = currentGame.current
    const next = gameReducer(current, action)
    if (!next || next === current) return
    currentGame.current = next
    dispatch(action)
    persist(next)
  }

  return {
    game, message,
    canContinue: game !== null || saved.status === 'found',
    hasSave: saved.status !== 'missing',
    startGame, continueGame, resetGame, resolveActivity,
    updateTeamProfile: (profile: TeamProfile) => applyAction({ type: 'UPDATE_TEAM_PROFILE', profile }),
    playMatch: () => applyAction({ type: 'PLAY_MATCH', rolls: { timing: Math.random(), player: Math.random(), outcome: Math.random() } }),
    advanceWeek: () => applyAction({ type: 'ADVANCE_WEEK' }),
    startNewSeason: () => applyAction({ type: 'START_NEW_SEASON' }),
    assignChampion: (role: Role, championId: string | null) => applyAction({ type: 'ASSIGN_CHAMPION', role, championId }),
    selectStrategy: (strategyId: StrategyId | null) => applyAction({ type: 'SELECT_STRATEGY', strategyId }),
    saveCurrentGame: () => { if (game) persist(game) },
  }
}

export type GameSession = ReturnType<typeof useGame>
