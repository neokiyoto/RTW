import type { TeamProfile } from '../types/domain.ts'
export type { TeamProfile } from '../types/domain.ts'

export const DEFAULT_TEAM_PROFILE: TeamProfile = { teamName: 'Road to Worlds', managerName: 'Manager' }
export const PROFILE_NAME_LIMIT = 32

export function isValidProfile(value: unknown): value is TeamProfile {
  if (typeof value !== 'object' || value === null) return false
  const profile = value as Record<string, unknown>
  return [profile.teamName, profile.managerName].every((name) => typeof name === 'string'
    && name === name.trim() && name.length > 0 && name.length <= PROFILE_NAME_LIMIT
    && !/\p{C}/u.test(name))
}

export function getTeamProfile(game: { profile?: TeamProfile }): TeamProfile {
  return game.profile ?? DEFAULT_TEAM_PROFILE
}
