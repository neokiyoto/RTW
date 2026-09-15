export type MatchRolls = { timing: number; player: number; outcome: number }
export type EncounterType = 'lane' | 'rotation' | 'invade' | 'duel' | 'objective' | 'recovery' | 'protection' | 'teamfight' | 'final'
export type LivePhase = 'Opening' | 'Early game' | 'Mid game' | 'Major objectives' | 'Late game' | 'Final engagement'
export type MatchSide = 'team' | 'opponent'
export type MatchSnapshot = {
  seconds: number
  phase: LivePhase
  momentum: number
  mapControl: number
  objectiveControl: number
  advantage: number
  initiative: MatchSide
  objective: 'available' | 'contested' | 'team' | 'opponent'
}
export type MatchEvent = {
  minute: number
  kind: 'phase' | 'turning-point' | 'setup' | 'reaction' | 'resolution'
  text: string
  momentum: number
  // Optional only for compatibility with six-entry V1 reports.
  seconds?: number
  encounter?: EncounterType
  chain?: number
  playerId?: string
  state?: MatchSnapshot
}
export type MatchReport = {
  engineVersion?: 2
  opponentId: string
  rolls: MatchRolls
  events: MatchEvent[]
  result: 'victory' | 'defeat'
  margin: number
}
