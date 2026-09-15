import assert from 'node:assert/strict'
import test from 'node:test'
import { champions } from '../data/champions.ts'
import { strategies } from '../data/strategies.ts'
import { gameReducer } from '../reducers/gameReducer.ts'
import { createInitialGame } from './createInitialGame.ts'
import { createEmptyAssignments, getMatchReadinessErrors, isEligibleForRole, ROLES } from './matchPreparation.ts'
import { validateSave, SAVE_VERSION } from './validateSave.ts'
import { loadSave, saveGame } from './saveStorage.ts'

const assign = (game, role, championId) => gameReducer(game, { type: 'ASSIGN_CHAMPION', role, championId })
const select = (game, strategyId) => gameReducer(game, { type: 'SELECT_STRATEGY', strategyId })
const roundTrip = (game) => validateSave(JSON.parse(JSON.stringify({ version: SAVE_VERSION, game })))
function completeActivity(game) {
  return gameReducer(game, { type: 'RESOLVE_WEEKLY_ACTIVITY', choice: { id: 'rest' }, rolls: { development: 0, event: 0.9, player: 0 } })
}
function readyGame() {
  let game = completeActivity(createInitialGame())
  for (const [role, id] of Object.entries({ Top: 'velsari', Jungle: 'brannoch', Mid: 'threnna', Carry: 'aurelis', Support: 'kelroth' })) game = assign(game, role, id)
  return select(game, 'objective-control')
}

test('new games have independent empty selections and describe every missing requirement', () => {
  const first = createInitialGame()
  const second = createInitialGame()
  assert.deepEqual(first.championAssignments, createEmptyAssignments())
  assert.equal(getMatchReadinessErrors(first).length, 7)
  first.championAssignments.Top = 'brannoch'
  assert.equal(second.championAssignments.Top, null)
})

test('all roles have three eligible choices, including each secondary-role pairing', () => {
  for (const role of ROLES) {
    const eligible = champions.filter((champion) => isEligibleForRole(champion, role))
    assert.equal(eligible.length, 3)
    for (const champion of eligible) assert.equal(assign(createInitialGame(), role, champion.id).championAssignments[role], champion.id)
  }
  assert.deepEqual(getMatchReadinessErrors(readyGame()), [])
})

test('invalid roles, unknown champions, wrong roles and duplicate flexible picks do not change state', () => {
  const game = assign(createInitialGame(), 'Top', 'brannoch')
  assert.equal(assign(game, 'Jungle', 'brannoch'), game)
  assert.equal(assign(game, 'Mid', 'brannoch'), game)
  assert.equal(assign(game, 'Support', 'missing'), game)
  assert.equal(assign(game, 'Unknown', 'brannoch'), game)
  assert.equal(assign(game, 'Support', undefined), game)
  assert.equal(assign(null, 'Top', 'brannoch'), null)
})

test('clearing and reassigning releases a flexible champion without altering the roster', () => {
  const game = assign(createInitialGame(), 'Top', 'brannoch')
  const cleared = assign(game, 'Top', null)
  const next = assign(cleared, 'Jungle', 'brannoch')
  assert.equal(game.championAssignments.Top, 'brannoch')
  assert.equal(next.championAssignments.Top, null)
  assert.equal(next.championAssignments.Jungle, 'brannoch')
  assert.deepEqual(next.players, game.players)
  assert.equal(assign(next, 'Jungle', 'brannoch'), next)
})

test('all four strategies can be selected, replaced and cleared; invalid IDs are rejected', () => {
  let game = createInitialGame()
  for (const strategy of strategies) {
    game = select(game, strategy.id)
    assert.equal(game.selectedStrategyId, strategy.id)
  }
  assert.equal(select(game, 'missing'), game)
  assert.equal(select(game, undefined), game)
  assert.equal(select(game, null).selectedStrategyId, null)
  assert.equal(select(null, 'early-aggression'), null)
})

test('readiness is derived and becomes incomplete immediately after clearing a choice', () => {
  const game = readyGame()
  assert.deepEqual(getMatchReadinessErrors(game), [])
  assert.deepEqual(getMatchReadinessErrors(assign(game, 'Carry', null)), ['Choose a champion for Carry.'])
  assert.deepEqual(getMatchReadinessErrors(select(game, null)), ['Choose a team strategy.'])
  const unprepared = { ...game, selectedWeeklyActivity: null, weeklyReport: null }
  assert.ok(getMatchReadinessErrors(unprepared).includes('Complete your weekly activity on the dashboard.'))
  const wrongRoster = { ...game, players: game.players.slice(1) }
  assert.ok(getMatchReadinessErrors(wrongRoster).includes('The roster needs one Top player.'))
})

test('partial and complete preparation survive local save round trips', () => {
  const entries = new Map()
  const storage = { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: (key) => entries.delete(key) }
  for (const game of [assign(createInitialGame(), 'Top', 'brannoch'), readyGame()]) {
    assert.equal(saveGame(game, storage).success, true)
    const loaded = loadSave(storage).game
    assert.deepEqual(loaded, game)
    assert.deepEqual(getMatchReadinessErrors(loaded), getMatchReadinessErrors(game))
  }
})

test('Phase 3 and Phase 4 saves migrate without losing condition or completed management', () => {
  for (const oldGame of [createInitialGame(), completeActivity(createInitialGame())]) {
    delete oldGame.championAssignments
    if (!oldGame.selectedWeeklyActivity) delete oldGame.weeklyReport
    const restored = roundTrip(oldGame)
    assert.deepEqual(restored.championAssignments, createEmptyAssignments())
    assert.deepEqual(restored.players, oldGame.players)
    assert.deepEqual(restored.weeklyReport, oldGame.weeklyReport ?? null)
    assert.equal(restored.selectedStrategyId, null)
  }
})

test('malformed assignment maps, duplicates, invalid roles and unknown strategy saves are rejected', () => {
  const mutations = [
    (game) => { game.championAssignments = null },
    (game) => { game.championAssignments = [] },
    (game) => { game.championAssignments = {} },
    (game) => { delete game.championAssignments.Mid },
    (game) => { game.championAssignments.Other = null },
    (game) => { game.championAssignments.Top = 5 },
    (game) => { game.championAssignments.Top = 'missing' },
    (game) => { game.championAssignments.Top = 'serrune' },
    (game) => { game.championAssignments.Mid = 'aurelis' },
    (game) => { game.selectedStrategyId = 'missing' },
    (game) => { delete game.selectedStrategyId },
  ]
  for (const mutate of mutations) {
    const game = readyGame()
    mutate(game)
    assert.equal(roundTrip(game), null, mutate.toString())
  }
})

test('management preserves preparation and starting or resetting clears it', () => {
  const selected = select(assign(createInitialGame(), 'Top', 'brannoch'), 'early-aggression')
  const managed = completeActivity(selected)
  assert.deepEqual(managed.championAssignments, selected.championAssignments)
  assert.equal(managed.selectedStrategyId, selected.selectedStrategyId)
  const fresh = gameReducer(managed, { type: 'START_GAME' })
  assert.deepEqual(fresh.championAssignments, createEmptyAssignments())
  assert.equal(fresh.selectedStrategyId, null)
  assert.equal(gameReducer(managed, { type: 'RESET_GAME' }), null)
})
