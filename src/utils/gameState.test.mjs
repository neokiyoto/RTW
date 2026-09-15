import assert from 'node:assert/strict'
import test from 'node:test'
import { initialRoster } from '../data/players.ts'
import { gameReducer } from '../reducers/gameReducer.ts'
import { createInitialGame } from './createInitialGame.ts'
import { loadSave, removeSave, SAVE_KEY, saveGame } from './saveStorage.ts'
import { SAVE_VERSION, validateSave } from './validateSave.ts'

function memoryStorage() {
  const items = new Map()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => { items.set(key, value) },
    removeItem: (key) => { items.delete(key) },
  }
}

test('new games and loaded games do not share mutable roster or history data', () => {
  const first = gameReducer(null, { type: 'START_GAME' })
  const second = gameReducer(first, { type: 'START_GAME' })
  const loaded = gameReducer(null, { type: 'LOAD_SAVE', game: first })
  first.players[0].morale = 0
  first.players[0].preferredChampionIds[0] = 'changed'
  assert.deepEqual(second.players, initialRoster)
  assert.deepEqual(loaded.players, initialRoster)
  assert.notEqual(first.matchHistory, second.matchHistory)
  assert.equal(second.week, 1)
  assert.equal(second.seasonLength, 6)
  assert.equal(second.wins + second.losses, 0)
  assert.equal(gameReducer(second, { type: 'RESET_GAME' }), null)
})

test('save, reload and reset round trip preserves values and other localStorage entries', () => {
  const storage = memoryStorage()
  storage.setItem('unrelated-setting', 'keep')
  assert.equal(loadSave(storage).status, 'missing')
  const game = createInitialGame()
  game.players[0].morale = 65
  game.teamSynergy = 67
  assert.equal(saveGame(game, storage).success, true)
  assert.equal(JSON.parse(storage.getItem(SAVE_KEY)).version, SAVE_VERSION)
  const restored = loadSave(storage)
  assert.equal(restored.status, 'found')
  assert.deepEqual(restored.game, game)
  assert.notEqual(restored.game, game)
  assert.equal(removeSave(storage).success, true)
  assert.equal(loadSave(storage).status, 'missing')
  assert.equal(storage.getItem('unrelated-setting'), 'keep')
})

test('malformed JSON and unsupported save versions remain untouched', () => {
  for (const raw of ['{', 'null', '[]', 'true', '42', '{}',
    JSON.stringify({ version: 2, game: createInitialGame() })]) {
    const storage = memoryStorage()
    storage.setItem(SAVE_KEY, raw)
    assert.equal(loadSave(storage).status, 'invalid', raw)
    assert.equal(storage.getItem(SAVE_KEY), raw)
  }
})

test('invalid nested data, identities, bounds and unsupported progression are rejected', () => {
  const mutations = [
    (game) => { delete game.players },
    (game) => { game.players = null },
    (game) => { game.players.pop() },
    (game) => { game.players[0] = null },
    (game) => { game.players[0] = {} },
    (game) => { game.players[0] = game.players[1] },
    (game) => { game.players[0].id = 'unknown' },
    (game) => { game.players[0].role = 'Jungle' },
    (game) => { game.players[0].roleFocus = 'Burst' },
    (game) => { game.players[0].playstyle = 'unknown' },
    (game) => { game.players[0].preferredChampionIds = ['unknown', 'orravel'] },
    (game) => { game.players[0].preferredChampionIds = null },
    (game) => { game.players[0].morale = 101 },
    (game) => { game.players[0].fatigue = -1 },
    (game) => { game.players[0].mechanics = '70' },
    (game) => { game.players[0].leadership = 0.5 },
    (game) => { game.players[0].potential = NaN },
    (game) => { game.players[0].matchesPlayed = Infinity },
    (game) => { game.teamSynergy = 101 },
    (game) => { game.fans = -1 },
    (game) => { game.week = 2 },
    (game) => { game.wins = 1 },
    (game) => { game.seasonLength = 7 },
    (game) => { game.seasonStatus = 'complete' },
    (game) => { game.selectedStrategyId = 'unknown-strategy' },
    (game) => { game.selectedWeeklyActivity = 'rest' },
    (game) => { game.opponentKnowledge = 3 },
    (game) => { game.matchHistory = [{}] },
  ]
  for (const mutate of mutations) {
    const game = createInitialGame()
    mutate(game)
    assert.equal(validateSave({ version: SAVE_VERSION, game }), null, mutate.toString())
  }
})

test('all required fields must be present and unknown fields are discarded', () => {
  const original = createInitialGame()
  for (const key of Object.keys(original)) {
    if (key === 'weeklyReport' || key === 'championAssignments' || key === 'currentMatch') continue // Older version 1 saves omit these fields.
    const game = createInitialGame()
    delete game[key]
    assert.equal(validateSave({ version: SAVE_VERSION, game }), null, key)
  }
  for (const key of Object.keys(original.players[0])) {
    const game = createInitialGame()
    delete game.players[0][key]
    assert.equal(validateSave({ version: SAVE_VERSION, game }), null, key)
  }
  const game = createInitialGame()
  game.unexpected = 'discard'
  game.players[0].skill = 99
  assert.deepEqual(validateSave({ version: SAVE_VERSION, game }), original)
})

test('failed writes and invalid state do not replace an existing save', () => {
  const storage = memoryStorage()
  saveGame(createInitialGame(), storage)
  const before = storage.getItem(SAVE_KEY)
  const fullStorage = { ...storage, setItem: () => { throw new Error('Quota exceeded') } }
  assert.equal(saveGame(createInitialGame(), fullStorage).success, false)
  const invalid = createInitialGame()
  invalid.players = []
  assert.equal(saveGame(invalid, storage).success, false)
  assert.equal(storage.getItem(SAVE_KEY), before)
})

test('blocked reads and removal return recoverable errors', () => {
  const blocked = {
    getItem: () => { throw new Error('Blocked') },
    setItem: () => { throw new Error('Blocked') },
    removeItem: () => { throw new Error('Blocked') },
  }
  assert.equal(loadSave(blocked).status, 'unavailable')
  assert.equal(saveGame(createInitialGame(), blocked).success, false)
  assert.equal(removeSave(blocked).success, false)
})

test('blocked access to the localStorage property does not throw', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window')
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { get localStorage() { throw new Error('SecurityError') } },
  })
  try {
    assert.equal(loadSave().status, 'unavailable')
    assert.equal(saveGame(createInitialGame()).success, false)
    assert.equal(removeSave().success, false)
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous)
    else delete globalThis.window
  }
})
