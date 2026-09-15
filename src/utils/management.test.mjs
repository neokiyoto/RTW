import assert from 'node:assert/strict'
import test from 'node:test'
import { createInitialGame } from './createInitialGame.ts'
import { gameReducer } from '../reducers/gameReducer.ts'
import { getDevelopmentChance, getOverallRating } from './management.ts'
import { validateSave, SAVE_VERSION } from './validateSave.ts'
import { saveGame, loadSave, SAVE_KEY } from './saveStorage.ts'

const sharedPlan = { development: 0, event: 0.99, player: 0 }
function resolve(game, choice, rolls = sharedPlan) {
  return gameReducer(game, { type: 'RESOLVE_WEEKLY_ACTIVITY', choice, rolls })
}
function roundTrip(game) {
  return validateSave(JSON.parse(JSON.stringify({ version: SAVE_VERSION, game })))
}

test('team training improves teamwork, fatigue and synergy without mutating its input', () => {
  const game = createInitialGame()
  const before = structuredClone(game)
  const next = resolve(game, { id: 'team-training' })
  for (let i = 0; i < game.players.length; i++) {
    assert.equal(next.players[i].teamwork, game.players[i].teamwork + 1)
    assert.equal(next.players[i].fatigue, game.players[i].fatigue + 8)
    assert.equal(next.players[i].mechanics, game.players[i].mechanics)
  }
  assert.equal(next.teamSynergy, 56) // Activity +4, shared-plan event +2.
  assert.deepEqual(game, before)
  assert.deepEqual(roundTrip(next), next)
})

test('individual training targets only the chosen player and attribute; success and failure are supported', () => {
  const game = createInitialGame()
  const choice = { id: 'individual-training', playerId: game.players[1].id, attribute: 'gameSense' }
  const success = resolve(game, choice)
  const failure = resolve(game, choice, { ...sharedPlan, development: 0.99 })
  assert.equal(success.players[1].gameSense, game.players[1].gameSense + 1)
  assert.equal(failure.players[1].gameSense, game.players[1].gameSense)
  for (const result of [success, failure]) {
    assert.equal(result.players[1].mechanics, game.players[1].mechanics)
    assert.equal(result.players[1].fatigue, game.players[1].fatigue + 12)
    assert.deepEqual(result.players[0], game.players[0])
    assert.deepEqual(result.players[2], game.players[2])
    assert.deepEqual(roundTrip(result), result)
  }
  assert.ok(getDevelopmentChance(90, 60) > getDevelopmentChance(40, 60))
  assert.ok(getDevelopmentChance(90, 60) > getDevelopmentChance(90, 90))
})

test('rest and team building improve condition without direct ability gains', () => {
  const game = createInitialGame()
  const rest = resolve(game, { id: 'rest' })
  const building = resolve(game, { id: 'team-building' })
  assert.equal(building.teamSynergy, 57)
  for (let i = 0; i < game.players.length; i++) {
    assert.equal(rest.players[i].fatigue, Math.max(0, game.players[i].fatigue - 15))
    assert.equal(rest.players[i].morale, game.players[i].morale + 3)
    assert.equal(building.players[i].morale, game.players[i].morale + 6)
    assert.equal(building.players[i].fatigue, game.players[i].fatigue)
    for (const stat of ['mechanics', 'gameSense', 'teamwork', 'leadership', 'potential', 'matchesPlayed']) {
      assert.equal(rest.players[i][stat], game.players[i][stat])
      assert.equal(building.players[i][stat], game.players[i][stat])
    }
  }
  assert.deepEqual(roundTrip(rest), rest)
  assert.deepEqual(roundTrip(building), building)
})

test('analysis reveals full knowledge and never changes player abilities', () => {
  const game = createInitialGame()
  const next = resolve(game, { id: 'opponent-analysis' })
  assert.equal(next.opponentKnowledge, 3)
  assert.deepEqual(next.players, game.players)
  assert.deepEqual(roundTrip(next), next)
})

test('each event can occur, has a small specific effect and is deterministic', () => {
  const game = createInitialGame()
  const confidenceRolls = { development: 0.5, event: 0, player: 0.99 }
  const confidence = resolve(game, { id: 'opponent-analysis' }, confidenceRolls)
  assert.equal(confidence.weeklyReport.event.id, 'practice-confidence')
  assert.equal(confidence.weeklyReport.event.playerId, game.players[4].id)
  assert.equal(confidence.players[4].morale, game.players[4].morale + 3)
  assert.deepEqual(confidence.players[0], game.players[0])
  const review = resolve(game, { id: 'opponent-analysis' }, { ...confidenceRolls, event: 0.5 })
  assert.equal(review.weeklyReport.event.id, 'long-review')
  assert.equal(review.players[4].fatigue, game.players[4].fatigue + 3)
  assert.deepEqual(confidence, resolve(game, { id: 'opponent-analysis' }, confidenceRolls))
  assert.deepEqual(roundTrip(confidence), confidence)
  assert.deepEqual(roundTrip(review), review)
})

test('activity and event cannot be repeated, including after save and reload', () => {
  const game = createInitialGame()
  const first = resolve(game, { id: 'rest' })
  assert.equal(resolve(first, { id: 'team-training' }), first)
  assert.equal(resolve(first, { id: 'rest' }, { development: 0.5, event: 0, player: 0.5 }), first)
  const values = new Map()
  const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) }
  assert.equal(saveGame(first, storage).success, true)
  const restored = loadSave(storage).game
  assert.equal(resolve(restored, { id: 'rest' }), restored)
  assert.deepEqual(restored, first)
  assert.ok(values.has(SAVE_KEY))
})

test('all bounded values stay within limits and reports show actual capped changes', () => {
  const game = createInitialGame()
  game.teamSynergy = 100
  for (const player of game.players) {
    player.teamwork = 100
    player.morale = 100
    player.fatigue = 100
    player.mechanics = 100
  }
  const trained = resolve(game, { id: 'team-training' })
  assert.deepEqual(trained.players, game.players)
  assert.deepEqual(trained.weeklyReport.changes, ['No values changed; affected ratings were already at their limits.'])
  const individual = resolve(game, { id: 'individual-training', playerId: game.players[0].id, attribute: 'mechanics' })
  assert.equal(individual.players[0].mechanics, 100)
  for (const player of game.players) player.fatigue = 0
  const rested = resolve(game, { id: 'rest' })
  assert.equal(rested.players[0].fatigue, 0)
  assert.equal(rested.players[0].morale, 100)
})

test('invalid choices and rolls are rejected without consuming the week', () => {
  const game = createInitialGame()
  for (const choice of [{ id: 'unknown' }, { id: 'individual-training', playerId: 'missing', attribute: 'mechanics' }, { id: 'individual-training', playerId: game.players[0].id, attribute: 'morale' }]) {
    assert.equal(resolve(game, choice), game)
  }
  for (const value of [-1, 1, NaN, Infinity]) {
    assert.equal(resolve(game, { id: 'rest' }, { ...sharedPlan, event: value }), game)
  }
  assert.equal(resolve(null, { id: 'rest' }), null)
})

test('Phase 3 saves migrate without losing player condition', () => {
  const legacy = createInitialGame()
  legacy.players[0].morale = 65
  delete legacy.weeklyReport
  const restored = roundTrip(legacy)
  assert.equal(restored.weeklyReport, null)
  assert.equal(restored.selectedWeeklyActivity, null)
  assert.equal(restored.players[0].morale, 65)
  assert.ok(resolve(restored, { id: 'rest' }).weeklyReport)
})

test('inconsistent or malformed management saves are rejected', () => {
  const complete = resolve(createInitialGame(), { id: 'opponent-analysis' })
  const mutations = [
    (game) => { game.weeklyReport = null },
    (game) => { delete game.weeklyReport },
    (game) => { game.selectedWeeklyActivity = null },
    (game) => { game.opponentKnowledge = 0 },
    (game) => { game.selectedWeeklyActivity = { id: 'unknown' } },
    (game) => { game.selectedWeeklyActivity = { id: 'individual-training', playerId: 'missing', attribute: 'mechanics' } },
    (game) => { game.weeklyReport.event.id = 'missing' },
    (game) => { game.weeklyReport.event.playerId = 'missing' },
    (game) => { game.weeklyReport.event.summary = '' },
    (game) => { game.weeklyReport.changes = [null] },
    (game) => { game.weeklyReport.changes = [] },
  ]
  for (const mutate of mutations) {
    const game = structuredClone(complete)
    mutate(game)
    assert.equal(roundTrip(game), null, mutate.toString())
  }
})

test('overall rating uses abilities only and never stores a Skill stat', () => {
  const player = createInitialGame().players[0]
  const rating = getOverallRating(player)
  player.morale = 0
  player.fatigue = 100
  player.potential = 100
  assert.equal(getOverallRating(player), rating)
  assert.equal('skill' in player, false)
})
