import { champions } from '../data/champions.ts'
import { strategies } from '../data/strategies.ts'
import type { Champion, Role } from '../types/domain.ts'
import type { ChampionAssignments, GameState } from '../types/gameState.ts'

export const ROLES: Role[] = ['Top', 'Jungle', 'Mid', 'Carry', 'Support']

export function createEmptyAssignments(): ChampionAssignments {
  return { Top: null, Jungle: null, Mid: null, Carry: null, Support: null }
}

export function isEligibleForRole(champion: Champion, role: Role): boolean {
  return champion.primaryRole === role || champion.secondaryRole === role
}

export function getAssignmentErrors(assignments: ChampionAssignments, requireAll = false): string[] {
  const errors: string[] = []
  const used = new Set<string>()
  for (const role of ROLES) {
    const id = assignments[role]
    if (id === null) {
      if (requireAll) errors.push(`Choose a champion for ${role}.`)
      continue
    }
    const champion = champions.find((entry) => entry.id === id)
    if (!champion || !isEligibleForRole(champion, role)) errors.push(`Choose an eligible champion for ${role}.`)
    if (used.has(id)) errors.push(`${champion?.name ?? id} cannot be assigned to more than one role.`)
    used.add(id)
  }
  return errors
}

export function getMatchReadinessErrors(game: GameState): string[] {
  const errors = getAssignmentErrors(game.championAssignments, true)
  for (const role of ROLES) {
    if (game.players.filter((player) => player.role === role).length !== 1) errors.push(`The roster needs one ${role} player.`)
  }
  if (!strategies.some((strategy) => strategy.id === game.selectedStrategyId)) errors.push('Choose a team strategy.')
  if (game.selectedWeeklyActivity === null || game.weeklyReport === null) errors.push('Complete your weekly activity on the dashboard.')
  return errors
}
