import { champions } from '../data/champions.ts'
import { strategies } from '../data/strategies.ts'
import { matchEncounters, opponentApproaches, strategyEncounters } from '../data/matchEncounters.ts'
import type { MatchPhase, Opponent, Player } from '../types/domain.ts'
import type { GameState } from '../types/gameState.ts'
import type { EncounterType, LivePhase, MatchEvent, MatchReport, MatchRolls, MatchSnapshot } from '../types/match.ts'
import { getMatchReadinessErrors } from './matchPreparation.ts'
import { getCurrentOpponent } from './season.ts'
import { randomFromRolls, validMatchRolls } from './matchRandom.ts'
import { championCompatibility, clampMatch, encounterSkill, phaseStrength } from './matchStrength.ts'

export { championCompatibility, phaseStrength } from './matchStrength.ts'
export { validMatchRolls } from './matchRandom.ts'

const round = (value: number) => Math.round(value * 100) / 100
const pick = <T,>(values: T[], random: () => number): T => values[Math.floor(random() * values.length)]

function phaseAt(progress: number): LivePhase {
  if (progress === 1) return 'Final engagement'
  if (progress === 0) return 'Opening'
  if (progress < 0.35) return 'Early game'
  if (progress < 0.55) return 'Mid game'
  if (progress < 0.75) return 'Major objectives'
  return 'Late game'
}

function strengthPhase(phase: LivePhase): MatchPhase {
  if (phase === 'Opening' || phase === 'Early game') return 'Early game'
  if (phase === 'Mid game' || phase === 'Major objectives') return 'Mid game'
  return 'Late game'
}

function chooseEncounter(game: GameState, opponent: Opponent, state: MatchSnapshot, previous: EncounterType | null, random: () => number): EncounterType {
  if (state.phase === 'Final engagement') return 'final'
  if (state.phase === 'Opening') return 'lane'
  if (state.phase === 'Major objectives' && state.objective === 'available') return 'objective'
  const strategyId = state.initiative === 'team' ? game.selectedStrategyId! : opponent.preferredStrategyId
  let choices = [...strategyEncounters[strategyId]]
  const approach = opponentApproaches[opponent.id]
  if (approach && state.initiative === 'opponent') choices.push(...approach.favoured)
  if (approach && state.initiative === 'team' && game.opponentKnowledge === 3) choices.push(approach.exposedBy, approach.exposedBy)
  if (state.phase === 'Early game') choices = choices.filter((type) => type !== 'teamfight')
  if (state.phase === 'Late game') choices.push('teamfight', 'teamfight')
  if (Math.abs(state.advantage) > 12) choices.push('recovery', 'recovery')
  if (state.initiative === 'team' && state.mapControl > 5 && state.objective === 'available') choices.push('objective', 'objective')
  if (state.initiative === 'opponent' && state.mapControl < -5 && state.objective === 'available') choices.push('objective', 'objective')
  // An objective needs time to become available again. Avoid the same encounter twice in succession.
  choices = choices.filter((type) => type !== previous && (type !== 'objective' || state.objective === 'available'))
  return pick(choices.length ? choices : ['rotation', 'duel'], random)
}

function choosePlayer(players: Player[], type: EncounterType, uses: Map<string, number>, phase: LivePhase, random: () => number): Player {
  const definition = matchEncounters[type]
  const weights = players.map((player) => {
    let weight = definition.roles.includes(player.role) ? 3 : 1
    if (definition.focuses.includes(player.roleFocus)) weight += 1
    if (player.playstyle === 'Aggressive' && ['invade', 'duel', 'lane'].includes(type)) weight += 2
    if (player.playstyle === 'Patient' && ['Late game', 'Final engagement'].includes(phase)) weight += 1.5
    // Rotate involvement without forcing every player into the same kind of action.
    return weight / (1 + (uses.get(player.id) ?? 0) * 1.5)
  })
  let draw = random() * weights.reduce((sum, weight) => sum + weight, 0)
  for (const [index, player] of players.entries()) {
    draw -= weights[index]
    if (draw < 0) return player
  }
  return players[players.length - 1]
}

function transitionText(before: number, after: number, won: boolean, type: EncounterType): string {
  if (type === 'final') {
    if (won && before < -5) return 'The final response overturns the opposing lead.'
    if (!won && before > 5) return 'The lead is lost at the last line.'
    return ''
  }
  if (before < -5 && after > 0) return 'Your team has fought its way back in front.'
  if (before > 5 && after < 0) return 'The advantage has slipped to the opposition.'
  if (won && before < -5) return 'The gap narrows, but your team still has ground to recover.'
  if (!won && before > 5) return 'Your team still leads, but the opposition has cut into its control.'
  return ''
}

export function simulateMatch(game: GameState, rolls: MatchRolls, opponent: Opponent = getCurrentOpponent(game)): MatchReport | null {
  if (game.seasonStatus !== 'active' || getMatchReadinessErrors(game).length || !validMatchRolls(rolls)) return null
  const random = randomFromRolls(rolls)
  const strategy = strategies.find((entry) => entry.id === game.selectedStrategyId)!
  const chainCount = 8 + Math.floor(random() * 3)
  const majorChain = 1 + Math.floor(rolls.timing * (chainCount - 2))
  const uses = new Map<string, number>()
  const wordingUses = new Map<string, number>()
  const state: MatchSnapshot = { seconds: 0, phase: 'Opening', momentum: 0, mapControl: 0, objectiveControl: 0, advantage: 0, initiative: 'team', objective: 'available' }
  const events: MatchEvent[] = []
  const captain = game.players.reduce((best, player) => player.leadership > best.leadership ? player : best)
  const carry = game.players.find((player) => player.role === 'Carry')!
  let previous: EncounterType | null = null
  let objectiveAvailableAt = 0
  let lastObjectiveWinner: 'team' | 'opponent' | null = null
  let won = false

  for (let chain = 0; chain < chainCount; chain += 1) {
    state.phase = phaseAt(chain / (chainCount - 1))
    const phase = strengthPhase(state.phase)
    const strength = phaseStrength(game, opponent, phase)
    // Initiative is influenced by pressure, but either team can make the next move.
    state.initiative = random() < Math.max(0.2, Math.min(0.8, 0.5 + (strength.team - strength.opponent) * 0.01 + state.momentum * 0.008)) ? 'team' : 'opponent'
    if (state.phase === 'Final engagement') state.initiative = state.advantage >= 0 ? 'team' : 'opponent'
    state.seconds = 120 + chain * 220 + Math.floor(random() * 60)
    if (state.seconds >= objectiveAvailableAt) state.objective = 'available'
    const type = chooseEncounter(game, opponent, state, previous, random)
    const definition = matchEncounters[type]
    // Carry protection is narrated through a teammate to avoid a player covering themselves.
    const candidates = game.players.filter((player) => definition.roles.includes(player.role) && (type !== 'protection' || player.role !== 'Carry'))
    const actor = choosePlayer(candidates, type, uses, state.phase, random)
    const supportingPlayers = game.players.filter((player) => player.id !== actor.id)
    const uninvolved = supportingPlayers.filter((player) => !uses.has(player.id))
    const partner = choosePlayer(uninvolved.length ? uninvolved : supportingPlayers, type, uses, state.phase, random)
    uses.set(actor.id, (uses.get(actor.id) ?? 0) + 1)
    uses.set(partner.id, (uses.get(partner.id) ?? 0) + 0.5)
    const champion = champions.find((entry) => entry.id === game.championAssignments[actor.role])!
    const carryChampion = champions.find((entry) => entry.id === game.championAssignments.Carry)!
    const tokens: Record<string, string> = {
      actor: actor.name, partner: partner.name, champion: champion.name, enemy: opponent.name,
      notable: opponent.notablePlayer.name, carry: `${carry.name} on ${carryChampion.name}`,
      lane: actor.role === 'Top' ? 'upper lane' : actor.role === 'Mid' ? 'middle lane' : 'lower lane',
    }
    function wording(key: 'teamOpen' | 'opponentOpen' | 'teamResponse' | 'opponentResponse' | 'teamWin' | 'opponentWin'): string {
      const identity = `${type}:${key}`
      const count = wordingUses.get(identity) ?? Math.floor(random() * definition[key].length)
      wordingUses.set(identity, count + 1)
      return definition[key][count % definition[key].length].replace(/\{(\w+)\}/g, (_, token: string) => tokens[token])
    }
    function emit(kind: MatchEvent['kind'], text: string, playerId = actor.id) {
      events.push({ minute: Math.floor(state.seconds / 60), seconds: state.seconds, kind, encounter: type, chain, playerId, text, momentum: state.momentum, state: { ...state } })
    }
    const before = state.advantage
    const direction = state.initiative === 'team' ? 1 : -1
    state.mapControl = round(clampMatch(state.mapControl + direction, 25))
    if (type === 'objective') state.objective = 'contested'
    let opening = wording(state.initiative === 'team' ? 'teamOpen' : 'opponentOpen')
    if (previous === 'objective') opening = `The last objective favours ${lastObjectiveWinner === 'team' ? 'your team' : 'the opposition'}. ${opening}`
    if (game.opponentKnowledge === 3 && phase === opponent.weakPhase) opening += ` The scouting notes give ${captain.name} a clear warning: ${opponent.exploitableWeakness[0].toLowerCase()}${opponent.exploitableWeakness.slice(1)}`
    emit('setup', opening)

    const actorEdge = encounterSkill(actor, champion, type)
    const teamwork = ((actor.teamwork + partner.teamwork) / 2 - 65) * 0.04
    const experience = Math.min(actor.matchesPlayed, 100) / 100
    const variance = (actor.playstyle === 'Aggressive' ? 17 : actor.playstyle === 'Patient' ? 12 : 14) - experience * 2
    let edge = strength.team - strength.opponent + actorEdge + teamwork
      + state.momentum * 0.1 + state.mapControl * 0.1 + state.objectiveControl * 0.4
      + (random() * 2 - 1) * variance
    const approach = opponentApproaches[opponent.id]
    if (approach?.favoured.includes(type)) edge -= 1.5
    if (definition.roles.includes(opponent.notablePlayer.role)) edge -= 0.75
    if (game.opponentKnowledge === 3 && approach?.exposedBy === type) edge += 2
    // Leadership and composure help the trailing side stabilise; a lead is useful but not permanent.
    if (state.advantage < -8) edge += (captain.leadership + actor.morale) / 70
    if (state.advantage > 8) edge -= opponent.overallStrength / 40
    if (type === 'protection') edge += (carry.mechanics + carry.teamwork - 130) * 0.08
    if (type === 'objective') edge += state.mapControl * 0.12

    state.seconds += 10 + Math.floor(random() * 18)
    if (chain === majorChain) {
      const chance = Math.max(0.2, Math.min(0.8, 0.5 + (actor.gameSense + actor.mechanics + actor.morale - actor.fatigue - 150) * 0.002
        + (captain.leadership + game.teamSynergy - 100) * 0.001 + (game.opponentKnowledge === 3 ? 0.06 : 0)
        + championCompatibility(actor, champion, strategy) * 0.01))
      const positive = rolls.outcome < chance
      edge += positive ? 6 : -6
      state.momentum = round(clampMatch(state.momentum + (positive ? 3 : -3), 25))
      const special = positive
        ? actor.gameSense >= actor.mechanics ? `${actor.name} reads the counter-move a moment early. ${champion.name} changes angle, giving ${partner.name} an unexpected opening.` : `${actor.name} commits to a narrow exchange on ${champion.name} and executes it cleanly. ${partner.name} immediately follows the opening.`
        : actor.fatigue >= 35 ? `${actor.name} reacts late after the long preparation week. ${champion.name} is caught out of line, and ${partner.name} must abandon the planned follow-up.` : `${actor.name} commits ${champion.name} before ${partner.name} is set. ${opponent.notablePlayer.name} spots the separation and calls an immediate response.`
      emit('turning-point', special)
      state.seconds += 6
    }
    const responseEdge = edge + (actor.gameSense + partner.teamwork - 130) * 0.04
    state.momentum = round(clampMatch(state.momentum + (responseEdge >= 0 ? 1 : -1), 25))
    emit('reaction', wording(responseEdge >= 0 ? 'teamResponse' : 'opponentResponse'), partner.id)
    // The final exchange is calculated only after all earlier actions and responses have changed the state.
    if (type === 'final') edge += state.advantage * 0.3
    edge = round(edge)
    won = edge > 0
    const resultDirection = won ? 1 : -1
    const gain = definition.impact * resultDirection
    state.advantage = round(clampMatch(type === 'final' ? edge : state.advantage * 0.86 + edge * 0.55 + gain, 100))
    state.momentum = round(clampMatch(state.momentum * 0.5 + gain + edge * 0.12, 25))
    state.mapControl = round(clampMatch(state.mapControl * 0.8 + gain, 25))
    if (type === 'objective') {
      state.objectiveControl = clampMatch(state.objectiveControl + resultDirection, 5)
      state.objective = won ? 'team' : 'opponent'
      lastObjectiveWinner = state.objective
      objectiveAvailableAt = state.seconds + 300
    }
    state.seconds += 12 + Math.floor(random() * 20)
    const transition = transitionText(before, state.advantage, won, type)
    emit('resolution', `${wording(won ? 'teamWin' : 'opponentWin')}${transition ? ` ${transition}` : ''}`)
    previous = type
  }
  const margin = state.advantage
  return { engineVersion: 2, opponentId: opponent.id, rolls: { timing: rolls.timing, player: rolls.player, outcome: rolls.outcome }, events, result: won ? 'victory' : 'defeat', margin }
}
