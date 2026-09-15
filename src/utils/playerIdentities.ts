import { givenNames, handles, surnames } from '../data/playerNames.ts'
import { initialRoster } from '../data/players.ts'
import { opponents } from '../data/opponents.ts'
import type { Role } from '../types/domain.ts'
import { createMatchRandom } from './matchRandom.ts'

export type PlayerIdentity = { name: string; fullName: string; role: Role }

export function createPlayerIdentities(seed: number) {
  const random = createMatchRandom(seed)
  function shuffle(values: string[]) {
    const result = [...values]
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
  const aliases = shuffle(handles)
  const first = shuffle(givenNames)
  const last = shuffle(surnames)
  let index = 0
  function roster(): PlayerIdentity[] {
    return initialRoster.map(({ role }) => {
      const identity = { role, name: aliases[index], fullName: `${first[index]} ${last[index]}` }
      index += 1
      return identity
    })
  }
  const players = roster()
  const opponentPlayers: Record<string, PlayerIdentity[]> = {}
  for (const opponent of opponents) opponentPlayers[opponent.id] = roster()
  return { players, opponentPlayers }
}
