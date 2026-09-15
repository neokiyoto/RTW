import assert from 'node:assert/strict'
import test from 'node:test'
import { createInitialGame } from './createInitialGame.ts'
import { gameReducer } from '../reducers/gameReducer.ts'
import { opponents } from '../data/opponents.ts'
import { simulateMatch, phaseStrength } from './simulateMatch.ts'
import { validateSave } from './validateSave.ts'

function ready() {
  const game = gameReducer(createInitialGame(), { type: 'RESOLVE_WEEKLY_ACTIVITY', choice: { id: 'rest' }, rolls: { development: 0, event: 0.9, player: 0 } })
  game.championAssignments = { Top: 'velsari', Jungle: 'brannoch', Mid: 'threnna', Carry: 'aurelis', Support: 'kelroth' }
  game.selectedStrategyId = 'objective-control'
  return game
}
const rolls = { timing: 0.5, player: 0.5, outcome: 0.3 }
const load = (game) => validateSave(JSON.parse(JSON.stringify({ version: 1, game })))

test('simulation is deterministic, chronological and leaves preparation untouched', () => {
  const game = ready()
  const before = structuredClone(game)
  const report = simulateMatch(game, rolls)
  assert.deepEqual(report, simulateMatch(game, rolls))
  assert.deepEqual(game, before)
  assert.ok(report.events.length >= 20 && report.events.length <= 35)
  assert.equal(report.events.filter((event) => event.kind === 'turning-point').length, 1)
  assert.ok(report.events.every((event, index) => index === 0 || event.seconds > report.events[index - 1].seconds))
  assert.equal(report.result, report.margin > 0 ? 'victory' : 'defeat')
  assert.equal(report.events.at(-1).state.advantage, report.margin)
})

test('unready games and invalid random inputs cannot play', () => {
  const game = createInitialGame()
  assert.equal(gameReducer(game, { type: 'PLAY_MATCH', rolls }), game)
  for (const bad of [NaN, Infinity, -1, 1, undefined]) {
    assert.equal(simulateMatch(ready(), { ...rolls, outcome: bad }), null)
  }
})

test('one bounded event can occur early, mid or late with either outcome', () => {
  for (const timing of [0, 0.5, 0.99]) for (const outcome of [0, 0.99]) {
    const report = simulateMatch(ready(), { ...rolls, timing, outcome })
    const index = report.events.findIndex((event) => event.kind === 'turning-point')
    assert.ok(index > 0 && index < report.events.length - 3)
    const shift = report.events[index].momentum - report.events[index - 1].momentum
    assert.ok(Math.abs(shift) <= 6.01)
    assert.equal(shift > 0, outcome === 0)
  }
})

test('ability dominates random events and potential does not affect performance', () => {
  for (const ability of [10, 95]) {
    const game = ready()
    for (const player of game.players) Object.assign(player, { mechanics: ability, gameSense: ability, teamwork: ability, leadership: ability })
    for (const opponent of opponents) for (const outcome of [0, 0.999]) {
      assert.equal(simulateMatch(game, { ...rolls, outcome }, opponent).result, ability === 95 ? 'victory' : 'defeat')
    }
  }
  const game = ready()
  const before = simulateMatch(game, rolls)
  game.players.forEach((player) => { player.potential = 0 })
  assert.deepEqual(simulateMatch(game, rolls), before)
})

test('condition, scouting and strategies change performance in the intended direction', () => {
  const game = ready()
  const base = phaseStrength(game, opponents[0], 'Early game')
  const tired = structuredClone(game)
  tired.players.forEach((player) => { player.fatigue = 100; player.morale = 0 })
  assert.ok(phaseStrength(tired, opponents[0], 'Early game').team < base.team)
  const scouted = { ...game, opponentKnowledge: 3 }
  assert.ok(phaseStrength(scouted, opponents[0], 'Early game').opponent < base.opponent)
  const early = { ...game, selectedStrategyId: 'early-aggression' }
  const late = { ...game, selectedStrategyId: 'late-game-scaling' }
  assert.ok(phaseStrength(early, opponents[0], 'Early game').team > phaseStrength(late, opponents[0], 'Early game').team)
  assert.ok(phaseStrength(late, opponents[0], 'Late game').team > phaseStrength(early, opponents[0], 'Late game').team)
  const profiles = opponents.map((opponent) => ['Early game', 'Mid game', 'Late game'].map((phase) => phaseStrength(game, opponent, phase).opponent - opponent.overallStrength).join(','))
  assert.equal(new Set(profiles).size, 4)
})

test('playing once locks preparation, preserves season state and survives saving', () => {
  const game = ready()
  const played = gameReducer(game, { type: 'PLAY_MATCH', rolls })
  assert.deepEqual(load(played), played)
  for (const action of [
    { type: 'PLAY_MATCH', rolls: { ...rolls, outcome: 0.99 } },
    { type: 'ASSIGN_CHAMPION', role: 'Top', championId: null },
    { type: 'SELECT_STRATEGY', strategyId: null },
    { type: 'RESOLVE_WEEKLY_ACTIVITY', choice: { id: 'rest' }, rolls },
  ]) assert.equal(gameReducer(played, action), played)
  assert.deepEqual({ ...played, currentMatch: null }, game)
  assert.equal(gameReducer(played, { type: 'START_GAME' }).currentMatch, null)
})

test('older saves migrate and corrupted or inconsistent reports are rejected', () => {
  const old = ready()
  delete old.currentMatch
  assert.equal(load(old).currentMatch, null)
  const played = gameReducer(ready(), { type: 'PLAY_MATCH', rolls })
  for (const mutate of [
    (game) => { game.currentMatch = {} },
    (game) => { game.currentMatch.rolls.outcome = 1 },
    (game) => { game.currentMatch.result = 'draw' },
    (game) => { game.currentMatch.margin += 1 },
    (game) => { game.currentMatch.events.pop() },
    (game) => { game.currentMatch.events[0].text = 'Unrelated text' },
    (game) => { game.championAssignments.Top = null },
    (game) => { game.currentMatch.opponentId = opponents[1].id },
  ]) {
    const corrupted = structuredClone(played)
    mutate(corrupted)
    assert.equal(load(corrupted), null)
  }
})
