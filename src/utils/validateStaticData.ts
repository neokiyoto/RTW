import type { Champion, Opponent, Player, Role, RoleFocus, Strategy } from '../types/domain.ts'

const MIN_RATING = 0
const MAX_RATING = 100

const focusesByRole: Record<Role, RoleFocus[]> = {
  Top: ['Frontline', 'Duelist', 'Split-Pusher'],
  Jungle: ['Vanguard', 'Assassin', 'Utility'],
  Mid: ['Control', 'Burst', 'Roaming'],
  Carry: ['Hypercarry', 'Lane Pressure', 'Artillery'],
  Support: ['Engage', 'Protection', 'Roaming'],
}

// Checks authored, TypeScript-checked data, not untrusted saves or external JSON.
export function validateStaticData(
  players: Player[],
  champions: Champion[],
  strategies: Strategy[],
  opponents: Opponent[],
): string[] {
  const errors: string[] = []

  function checkEntries(label: string, entries: { id: string; name: string }[]) {
    const ids = new Set<string>()
    for (const entry of entries) {
      if (!entry.id.trim() || !entry.name.trim()) {
        errors.push(`${label}: IDs and names must not be blank.`)
      }
      if (ids.has(entry.id)) errors.push(`${label}: duplicate ID ${entry.id}.`)
      ids.add(entry.id)
    }
  }

  function checkRating(label: string, value: number) {
    if (!Number.isInteger(value) || value < MIN_RATING || value > MAX_RATING) {
      errors.push(`${label} must be a whole number from ${MIN_RATING} to ${MAX_RATING}.`)
    }
  }

  checkEntries('Players', players)
  checkEntries('Champions', champions)
  checkEntries('Strategies', strategies)
  checkEntries('Opponents', opponents)

  if (players.length !== 5) errors.push('The initial roster must contain five players.')
  if (champions.length !== 12) errors.push('The initial pool must contain 12 champions.')
  if (strategies.length !== 4) errors.push('There must be four strategies.')
  if (opponents.length !== 4) errors.push('There must be four opponents.')

  for (const role of Object.keys(focusesByRole) as Role[]) {
    if (players.filter((player) => player.role === role).length !== 1) {
      errors.push(`The roster must contain exactly one ${role} player.`)
    }
    const eligible = champions.filter(
      (champion) => champion.primaryRole === role || champion.secondaryRole === role,
    )
    if (eligible.length !== 3) errors.push(`${role} must have three eligible champions.`)
  }

  const flexiblePairs: [Role, Role][] = [['Top', 'Jungle'], ['Jungle', 'Support'], ['Mid', 'Carry']]
  for (const [first, second] of flexiblePairs) {
    const matches = champions.filter((champion) =>
      (champion.primaryRole === first && champion.secondaryRole === second)
      || (champion.primaryRole === second && champion.secondaryRole === first),
    )
    if (matches.length !== 1) errors.push(`There must be one ${first}/${second} champion.`)
  }

  for (const player of players) {
    if (!focusesByRole[player.role].includes(player.roleFocus)) {
      errors.push(`${player.name}: ${player.roleFocus} is not a ${player.role} focus.`)
    }
    const ratings = {
      mechanics: player.mechanics, gameSense: player.gameSense,
      teamwork: player.teamwork, leadership: player.leadership,
      morale: player.morale, fatigue: player.fatigue, potential: player.potential,
    }
    for (const [stat, value] of Object.entries(ratings)) checkRating(`${player.name}: ${stat}`, value)
    if (!Number.isInteger(player.matchesPlayed) || player.matchesPlayed < 0) {
      errors.push(`${player.name}: matches played must be a non-negative whole number.`)
    }
    if (player.preferredChampionIds.length !== 2 || new Set(player.preferredChampionIds).size !== 2) {
      errors.push(`${player.name} must prefer two distinct champions.`)
    }
    for (const id of player.preferredChampionIds) {
      const champion = champions.find((entry) => entry.id === id)
      if (!champion) {
        errors.push(`${player.name}: unknown preferred champion ${id}.`)
      } else if (champion.primaryRole !== player.role && champion.secondaryRole !== player.role) {
        errors.push(`${player.name}: ${champion.name} is not eligible for ${player.role}.`)
      }
    }
  }

  for (const champion of champions) {
    if (champion.primaryRole === champion.secondaryRole) {
      errors.push(`${champion.name}: secondary role must differ from primary role.`)
    }
    const ratings = {
      earlyGame: champion.earlyGame, lateGame: champion.lateGame,
      teamFighting: champion.teamFighting, difficulty: champion.difficulty,
    }
    for (const [stat, value] of Object.entries(ratings)) checkRating(`${champion.name}: ${stat}`, value)
  }

  for (const strategy of strategies) {
    if (!strategy.description.trim() || strategy.supportingFocuses.length === 0) {
      errors.push(`${strategy.name}: provide a description and supporting focuses.`)
    }
  }

  for (const opponent of opponents) {
    checkRating(`${opponent.name}: overall strength`, opponent.overallStrength)
    if (!strategies.some((strategy) => strategy.id === opponent.preferredStrategyId)) {
      errors.push(`${opponent.name}: unknown preferred strategy ${opponent.preferredStrategyId}.`)
    }
    if (opponent.strongPhase === opponent.weakPhase) {
      errors.push(`${opponent.name}: strong and weak phases must differ.`)
    }
    const descriptions = [opponent.identity, opponent.exploitableWeakness,
      opponent.draftingTendency, opponent.notablePlayer.name, opponent.notablePlayer.description]
    if (descriptions.some((description) => !description.trim())) {
      errors.push(`${opponent.name}: opponent details must not be blank.`)
    }
  }

  return errors
}
