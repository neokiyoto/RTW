import assert from 'node:assert/strict'
import test from 'node:test'
import { gameReducer } from '../reducers/gameReducer.ts'
import { createInitialGame } from './createInitialGame.ts'
import { getCurrentOpponent, getStandings, seasonSchedule, TEAM_ID } from './season.ts'
import { validateSave } from './validateSave.ts'

const rolls = { timing: 0.5, player: 0.5, outcome: 0.3 }
const assignments = { Top: 'velsari', Jungle: 'brannoch', Mid: 'threnna', Carry: 'aurelis', Support: 'kelroth' }

function prepare(game) {
  let next = gameReducer(game, { type: 'RESOLVE_WEEKLY_ACTIVITY', choice: { id: 'rest' }, rolls: { development: 0, event: 0.9, player: 0 } })
  for (const [role, championId] of Object.entries(assignments)) next = gameReducer(next, { type: 'ASSIGN_CHAMPION', role, championId })
  next = gameReducer(next, { type: 'SELECT_STRATEGY', strategyId: 'objective-control' })
  return next
}
function playAndAdvance(game, outcome = 0.3) {
  return gameReducer(gameReducer(prepare(game), { type: 'PLAY_MATCH', rolls: { ...rolls, outcome } }), { type: 'ADVANCE_WEEK' })
}
const load = (game) => validateSave(JSON.parse(JSON.stringify({ version: 1, game })))

test('the season has six scheduled player fixtures and a different other-team fixture each week', () => {
  assert.equal(seasonSchedule.length, 6)
  assert.deepEqual(seasonSchedule.map((week) => week.opponentId), ['cinderwake-five', 'meridian-keepers', 'stillharbour-ward', 'crosswind-parallax', 'meridian-keepers', 'cinderwake-five'])
  assert.equal(new Set(seasonSchedule.map((week) => `${week.otherFixture.firstId}:${week.otherFixture.secondId}`)).size, 5)
  for (const { opponentId, otherFixture } of seasonSchedule) {
    assert.notEqual(otherFixture.firstId, otherFixture.secondId)
    assert.ok(![otherFixture.firstId, otherFixture.secondId].includes(opponentId))
    assert.ok([otherFixture.firstId, otherFixture.secondId].includes(otherFixture.winnerId))
  }
})

test('advancing applies one match result atomically and opens a clean next week', () => {
  const before = prepare(createInitialGame())
  const played = gameReducer(before, { type: 'PLAY_MATCH', rolls })
  const after = gameReducer(played, { type: 'ADVANCE_WEEK' })
  const won = played.currentMatch.result === 'victory'
  assert.equal(after.week, 2)
  assert.equal(after.wins, won ? 1 : 0)
  assert.equal(after.losses, won ? 0 : 1)
  assert.equal(after.fans, before.fans + (won ? 15 : -5))
  assert.equal(after.teamSynergy, before.teamSynergy + (won ? 2 : -1))
  assert.equal(after.matchHistory.length, 1)
  assert.equal(after.matchHistory[0].opponentId, 'cinderwake-five')
  assert.equal(after.currentMatch, null)
  assert.equal(after.selectedWeeklyActivity, null)
  assert.deepEqual(after.championAssignments, { Top: null, Jungle: null, Mid: null, Carry: null, Support: null })
  assert.ok(after.players.every((player, index) => player.matchesPlayed === before.players[index].matchesPlayed + 1 && player.fatigue === before.players[index].fatigue + 8))
  assert.equal(getCurrentOpponent(after).id, 'meridian-keepers')
})

test('advance cannot run without a report and completed matches cannot be applied twice', () => {
  const game = createInitialGame()
  assert.equal(gameReducer(game, { type: 'ADVANCE_WEEK' }), game)
  const played = gameReducer(prepare(game), { type: 'PLAY_MATCH', rolls })
  const advanced = gameReducer(played, { type: 'ADVANCE_WEEK' })
  assert.equal(gameReducer(advanced, { type: 'ADVANCE_WEEK' }), advanced)
  assert.equal(gameReducer(advanced, { type: 'START_NEW_SEASON' }), advanced)
})

test('six matches complete the season with history and a consistent five-team table', () => {
  let game = createInitialGame()
  for (let week = 0; week < 6; week += 1) game = playAndAdvance(game, week % 2 === 0 ? 0.3 : 0.99)
  assert.equal(game.seasonStatus, 'complete')
  assert.equal(game.week, 6)
  assert.equal(game.matchHistory.length, 6)
  assert.equal(game.wins + game.losses, 6)
  assert.deepEqual(game.matchHistory.map((match) => match.opponentId), seasonSchedule.map((week) => week.opponentId))
  const table = getStandings(game)
  assert.equal(table.length, 5)
  assert.equal(table.reduce((sum, team) => sum + team.wins, 0), 12)
  assert.equal(table.find((team) => team.id === TEAM_ID).played, 6)
  assert.deepEqual(load(game), game)
})

test('a new season keeps player growth and experience while clearing season-only state', () => {
  let game = createInitialGame()
  game.players[0].mechanics += 2
  for (let week = 0; week < 6; week += 1) game = playAndAdvance(game)
  const next = gameReducer(game, { type: 'START_NEW_SEASON' })
  assert.equal(next.seasonStatus, 'active')
  assert.equal(next.week, 1)
  assert.equal(next.wins + next.losses, 0)
  assert.equal(next.matchHistory.length, 0)
  assert.equal(next.players[0].mechanics, game.players[0].mechanics)
  assert.equal(next.players[0].matchesPlayed, game.players[0].matchesPlayed)
  assert.ok(next.players.every((player) => player.morale >= 70 && player.fatigue <= 15))
})

test('a completed season rejects preparation changes and remains loadable', () => {
  let game = createInitialGame()
  for (let week = 0; week < 6; week += 1) game = playAndAdvance(game)
  for (const action of [
    { type: 'ASSIGN_CHAMPION', role: 'Top', championId: 'brannoch' },
    { type: 'SELECT_STRATEGY', strategyId: 'early-aggression' },
  ]) {
    assert.equal(gameReducer(game, action), game)
    assert.deepEqual(load(gameReducer(game, action)), game)
  }
})

test('each scheduled match credits only its participants with one appearance', () => {
  let game = createInitialGame()
  for (const week of seasonSchedule) {
    const before = getStandings(game)
    game = playAndAdvance(game)
    const after = getStandings(game)
    const participants = [TEAM_ID, week.opponentId, week.otherFixture.firstId, week.otherFixture.secondId]
    for (const team of after) {
      const previous = before.find((entry) => entry.id === team.id)
      assert.equal(team.played - previous.played, participants.includes(team.id) ? 1 : 0)
    }
  }
})

test('invalid progression saves are rejected and Phase 6 saves still migrate', () => {
  const phaseSix = prepare(createInitialGame())
  const phaseSixReport = gameReducer(phaseSix, { type: 'PLAY_MATCH', rolls })
  delete phaseSixReport.matchHistory[0]
  assert.deepEqual(load(phaseSixReport), phaseSixReport)
  const progressed = playAndAdvance(createInitialGame())
  for (const mutate of [
    (game) => { game.week = 1 },
    (game) => { game.wins += 1 },
    (game) => { game.matchHistory[0].opponentId = 'wrong' },
    (game) => { game.matchHistory[0].week = 2 },
    (game) => { game.matchHistory[0].result = 'draw' },
    (game) => { game.seasonStatus = 'complete' },
  ]) {
    const corrupted = structuredClone(progressed)
    mutate(corrupted)
    assert.equal(load(corrupted), null)
  }
})
