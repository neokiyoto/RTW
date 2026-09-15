import { champions } from '../data/champions.ts'
import { opponents } from '../data/opponents.ts'
import { initialRoster } from '../data/players.ts'
import { strategies } from '../data/strategies.ts'
import { validateStaticData } from './validateStaticData.ts'

const errors = validateStaticData(initialRoster, champions, strategies, opponents)

if (errors.length > 0) {
  throw new Error(`Static game data is invalid:\n${errors.join('\n')}`)
}

console.log('Static data valid: 5 players, 12 champions, 3 choices per role, 4 strategies and 4 opponents.')
