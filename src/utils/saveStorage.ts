import type { GameState } from '../types/gameState.ts'
import { SAVE_VERSION, validateSave } from './validateSave.ts'

export const SAVE_KEY = 'text-esports-manager-save-v1'

export type LoadResult = {
  status: 'found' | 'missing' | 'invalid' | 'unavailable'
  game: GameState | null
  message: string
}

type WriteResult = { success: boolean; message: string }
type SaveStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

// Resolve localStorage inside try/catch: even accessing it can be blocked.
export function loadSave(storage?: SaveStorage): LoadResult {
  try {
    const raw = (storage ?? window.localStorage).getItem(SAVE_KEY)
    if (raw === null) return { status: 'missing', game: null, message: 'No saved game yet.' }
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      return { status: 'invalid', game: null, message: 'The saved game is invalid or incompatible. Start a new game or reset the save.' }
    }
    const game = validateSave(parsed)
    if (!game) {
      return { status: 'invalid', game: null, message: 'The saved game is invalid or incompatible. Start a new game or reset the save.' }
    }
    return { status: 'found', game, message: 'A saved game is available. Choose Continue to load it.' }
  } catch {
    return { status: 'unavailable', game: null, message: 'Browser storage is unavailable. You can start a game, but progress may be lost when you leave.' }
  }
}

export function saveGame(game: GameState, storage?: SaveStorage): WriteResult {
  const save = { version: SAVE_VERSION, game }
  if (!validateSave(save)) return { success: false, message: 'The game could not be saved because its data is invalid.' }
  try {
    (storage ?? window.localStorage).setItem(SAVE_KEY, JSON.stringify(save))
    return { success: true, message: 'Game saved in this browser.' }
  } catch {
    return { success: false, message: 'The game is open, but saving failed. Your progress may be lost when you leave. Try Save game again.' }
  }
}

export function removeSave(storage?: SaveStorage): WriteResult {
  try {
    (storage ?? window.localStorage).removeItem(SAVE_KEY)
    return { success: true, message: 'Game reset. The saved game has been removed.' }
  } catch {
    return { success: false, message: 'Reset failed because browser storage is unavailable. Your current game has been kept. Try again.' }
  }
}
