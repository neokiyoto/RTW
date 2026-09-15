export type Role = 'Top' | 'Jungle' | 'Mid' | 'Carry' | 'Support'

export type RoleFocus =
  | 'Frontline' | 'Duelist' | 'Split-Pusher'
  | 'Vanguard' | 'Assassin' | 'Utility'
  | 'Control' | 'Burst' | 'Roaming'
  | 'Hypercarry' | 'Lane Pressure' | 'Artillery'
  | 'Engage' | 'Protection'

export type Playstyle = 'Aggressive' | 'Balanced' | 'Patient'

export type StrategyId =
  | 'early-aggression'
  | 'objective-control'
  | 'late-game-scaling'
  | 'protect-the-carry'

export type MatchPhase = 'Early game' | 'Mid game' | 'Late game'

// Ratings and condition values use whole numbers from 0 to 100.
export type Player = {
  id: string
  name: string
  fullName?: string
  role: Role
  roleFocus: RoleFocus
  playstyle: Playstyle
  preferredChampionIds: [string, string]
  mechanics: number
  gameSense: number
  teamwork: number
  leadership: number
  morale: number
  fatigue: number
  potential: number
  matchesPlayed: number
}

export type Champion = {
  id: string
  name: string
  primaryRole: Role
  secondaryRole?: Role
  archetype: RoleFocus
  earlyGame: number
  lateGame: number
  teamFighting: number
  difficulty: number
}

export type Strategy = {
  id: StrategyId
  name: string
  description: string
  supportingFocuses: RoleFocus[]
}

export type Opponent = {
  id: string
  name: string
  identity: string
  overallStrength: number
  preferredStrategyId: StrategyId
  strongPhase: MatchPhase
  weakPhase: MatchPhase
  notablePlayer: { name: string; role: Role; description: string }
  exploitableWeakness: string
  draftingTendency: string
}

export type TeamProfile = { teamName: string; managerName: string }
