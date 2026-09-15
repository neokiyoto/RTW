import { opponents } from '../data/opponents.ts'
import type { GameState } from '../types/gameState.ts'
import { createPlayerIdentities } from './playerIdentities.ts'
import { getTeamProfile } from './teamProfile.ts'

export const TEAM_ID = 'road-to-worlds'

type OtherFixture = { firstId: string; secondId: string; winnerId: string }
export type SeasonWeek = { opponentId: string; otherFixture: OtherFixture }

export const seasonSchedule: SeasonWeek[] = [
  { opponentId: 'cinderwake-five', otherFixture: { firstId: 'meridian-keepers', secondId: 'stillharbour-ward', winnerId: 'meridian-keepers' } },
  { opponentId: 'meridian-keepers', otherFixture: { firstId: 'cinderwake-five', secondId: 'crosswind-parallax', winnerId: 'cinderwake-five' } },
  { opponentId: 'stillharbour-ward', otherFixture: { firstId: 'meridian-keepers', secondId: 'crosswind-parallax', winnerId: 'crosswind-parallax' } },
  { opponentId: 'crosswind-parallax', otherFixture: { firstId: 'cinderwake-five', secondId: 'stillharbour-ward', winnerId: 'stillharbour-ward' } },
  { opponentId: 'meridian-keepers', otherFixture: { firstId: 'cinderwake-five', secondId: 'crosswind-parallax', winnerId: 'crosswind-parallax' } },
  { opponentId: 'cinderwake-five', otherFixture: { firstId: 'stillharbour-ward', secondId: 'crosswind-parallax', winnerId: 'stillharbour-ward' } },
]

export type Standing = { id: string; name: string; wins: number; losses: number; played: number; isPlayer: boolean }

export function getCurrentOpponent(game: Pick<GameState, 'week' | 'identitySeed'>) {
  const opponent = opponents.find((entry) => entry.id === seasonSchedule[game.week - 1]?.opponentId) ?? opponents[0]
  return getOpponentWithPlayers(game, opponent.id)
}

export function getOpponentWithPlayers(game: Pick<GameState, 'identitySeed'>, opponentId: string) {
  const opponent = opponents.find((entry) => entry.id === opponentId) ?? opponents[0]
  const roster = game.identitySeed === undefined ? [] : createPlayerIdentities(game.identitySeed).opponentPlayers[opponent.id]
  const notable = roster.find((player) => player.role === opponent.notablePlayer.role)
  return { ...opponent, roster, notablePlayer: { ...opponent.notablePlayer, ...(notable ? { name: notable.name } : {}) } }
}

export function getStandings(game: Pick<GameState, 'matchHistory' | 'profile'>): Standing[] {
  const standings = new Map<string, Standing>([
    [TEAM_ID, { id: TEAM_ID, name: getTeamProfile(game).teamName, wins: 0, losses: 0, played: 0, isPlayer: true }],
    ...opponents.map((opponent) => [opponent.id, { id: opponent.id, name: opponent.name, wins: 0, losses: 0, played: 0, isPlayer: false }] as const),
  ])
  const apply = (winnerId: string, loserId: string) => {
    const winner = standings.get(winnerId)!
    const loser = standings.get(loserId)!
    winner.wins += 1; winner.played += 1; loser.losses += 1; loser.played += 1
  }
  for (const match of game.matchHistory) {
    apply(match.result === 'victory' ? TEAM_ID : match.opponentId, match.result === 'victory' ? match.opponentId : TEAM_ID)
    const fixture = seasonSchedule[match.week - 1]?.otherFixture
    if (fixture) apply(fixture.winnerId, fixture.winnerId === fixture.firstId ? fixture.secondId : fixture.firstId)
  }
  return [...standings.values()].sort((first, second) => second.wins - first.wins || first.losses - second.losses || second.played - first.played || first.name.localeCompare(second.name))
}

export function getSeasonResult(game: Pick<GameState, 'wins' | 'losses'>): string {
  if (game.wins >= 5) return 'A title-worthy run. Your team set the pace across the season.'
  if (game.wins >= 3) return 'A competitive season. The team showed it can challenge the league.'
  return 'A difficult season, but the roster has a clear base to build on next time.'
}
