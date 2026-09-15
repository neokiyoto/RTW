import type { MatchRolls } from '../types/match.ts'

export function validMatchRolls(value: unknown): value is MatchRolls {
  if (typeof value !== 'object' || value === null) return false
  return ['timing', 'player', 'outcome'].every((key) => {
    const roll = (value as Record<string, unknown>)[key]
    return typeof roll === 'number' && Number.isFinite(roll) && roll >= 0 && roll < 1
  })
}

// A small seeded generator keeps replay, saving and tests deterministic.
export function createMatchRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

export function randomFromRolls(rolls: MatchRolls): () => number {
  // Outcome is reserved for the one major event, so changing it does not reshuffle the match.
  return createMatchRandom((Math.floor(rolls.timing * 4294967296) ^ Math.floor(rolls.player * 2147483648)) >>> 0)
}
