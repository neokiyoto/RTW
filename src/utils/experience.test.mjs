import assert from 'node:assert/strict'
import test from 'node:test'
import { createInitialGame } from './createInitialGame.ts'
import { createPlayerIdentities } from './playerIdentities.ts'
import { getCurrentOpponent } from './season.ts'
import { getWeeklyFlow } from './weeklyFlow.ts'
import { gameReducer } from '../reducers/gameReducer.ts'
import { validateSave } from './validateSave.ts'
import { estimatedGoldLead, splitCommentary } from './matchPresentation.ts'

const restore = (game) => validateSave(JSON.parse(JSON.stringify({ version: 1, game })))
function prepare(game) {
  let state = gameReducer(game, { type: 'RESOLVE_WEEKLY_ACTIVITY', choice: { id: 'rest' }, rolls: { development: 0, event: 0.9, player: 0 } })
  for (const [role, championId] of Object.entries({ Top: 'brannoch', Jungle: 'nyssik', Mid: 'threnna', Carry: 'serrune', Support: 'mirethi' })) state = gameReducer(state, { type: 'ASSIGN_CHAMPION', role, championId })
  return gameReducer(state, { type: 'SELECT_STRATEGY', strategyId: 'objective-control' })
}

test('seeded identities provide 25 unique handles and stable, distinct new games', () => {
  for (const seed of [0, 1, 77, 2026, 4294967295]) {
    const identities = createPlayerIdentities(seed)
    assert.deepEqual(createPlayerIdentities(seed), identities)
    const people = [...identities.players, ...Object.values(identities.opponentPlayers).flat()]
    assert.equal(people.length, 25)
    assert.equal(new Set(people.map((player) => player.name.toLowerCase())).size, 25)
    assert.ok(people.every((player) => /^[A-Za-z]{3,12}$/.test(player.name) && player.fullName.split(' ').length === 2))
    assert.deepEqual(restore(createInitialGame(seed)), createInitialGame(seed))
  }
  assert.notDeepEqual(createInitialGame(1).players, createInitialGame(2).players)
})

test('seeded roster and opponent names persist through matches, six weeks and a new season', () => {
  let game = createInitialGame(1729)
  const identities = game.players.map(({ name, fullName }) => ({ name, fullName }))
  for (let week = 1; week <= 6; week += 1) {
    game = prepare(game)
    const opponent = getCurrentOpponent(game)
    assert.equal(opponent.roster.length, 5)
    assert.equal(opponent.notablePlayer.name, opponent.roster.find((player) => player.role === opponent.notablePlayer.role).name)
    game = gameReducer(game, { type: 'PLAY_MATCH', rolls: { timing: 0.4, player: 0.8, outcome: 0.3 } })
    assert.deepEqual(restore(game), game)
    assert.ok(game.currentMatch.events.some((event) => event.text.includes(game.players[0].name)))
    game = gameReducer(restore(game), { type: 'ADVANCE_WEEK' })
  }
  game = gameReducer(game, { type: 'START_NEW_SEASON' })
  assert.deepEqual(game.players.map(({ name, fullName }) => ({ name, fullName })), identities)
  assert.deepEqual(restore(game), game)
})

test('old identities remain unchanged and invalid seeded identities are rejected', () => {
  const legacy = prepare(createInitialGame())
  assert.deepEqual(restore(legacy), legacy)
  for (const change of [
    (game) => { game.identitySeed = -1 },
    (game) => { game.identitySeed = 4294967296 },
    (game) => { game.identitySeed = '4' },
    (game) => { game.players[0].name = game.players[1].name },
    (game) => { delete game.identitySeed },
    (game) => { delete game.players[0].fullName },
  ]) {
    const game = createInitialGame(4)
    change(game)
    assert.equal(restore(game), null)
  }
})

test('weekly guidance follows activity, preparation, match and season completion', () => {
  let game = createInitialGame(42)
  assert.equal(getWeeklyFlow(game).step, 0)
  game = gameReducer(game, { type: 'RESOLVE_WEEKLY_ACTIVITY', choice: { id: 'rest' }, rolls: { development: 0, event: 0.9, player: 0 } })
  assert.equal(getWeeklyFlow(game).step, 1)
  game = prepare(game)
  assert.equal(getWeeklyFlow(game).step, 2)
  game = gameReducer(game, { type: 'PLAY_MATCH', rolls: { timing: 0.3, player: 0.3, outcome: 0.3 } })
  assert.equal(getWeeklyFlow(game).action, 'Watch match & result')
  game = gameReducer(game, { type: 'ADVANCE_WEEK' })
  assert.equal(getWeeklyFlow(game).step, 0)
  assert.equal(getWeeklyFlow({ ...game, seasonStatus: 'complete' }).to, '/standings')
})

test('commentary highlights whole names safely without changing or losing text', () => {
  const text = 'Veyrin and Veyrin Vale retreat. NotVeyrin stays. <script> is plain text.'
  const tokens = [{ text: 'Veyrin', kind: 'player' }, { text: 'Veyrin Vale', kind: 'opponent' }, { text: 'retreat', kind: 'keyword' }]
  const parts = splitCommentary(text, tokens)
  assert.equal(parts.map((part) => part.text).join(''), text)
  assert.deepEqual(parts.filter((part) => part.kind).map((part) => part.kind), ['player', 'opponent', 'keyword'])
})

test('gold estimate represents the supplied snapshot with zero before playback', () => {
  assert.equal(estimatedGoldLead(), 0)
  assert.equal(estimatedGoldLead({ state: { advantage: 12.5 }, momentum: -4 }), 1250)
  assert.equal(estimatedGoldLead({ state: { advantage: -8 }, momentum: 4 }), -800)
  assert.equal(estimatedGoldLead({ momentum: 3 }), 300)
})


test('team and manager names survive saves, renaming a played match and a new season', () => {
  const profile = { teamName: 'Scarlet Circuit', managerName: 'Amir' }
  let game = gameReducer(null, { type: 'START_GAME', identitySeed: 48, profile })
  assert.deepEqual(restore(game), game)
  for (let week = 1; week <= 6; week += 1) {
    game = prepare(game)
    game = gameReducer(game, { type: 'PLAY_MATCH', rolls: { timing: 0.4, player: 0.8, outcome: 0.3 } })
    const report = structuredClone(game.currentMatch)
    game = gameReducer(game, { type: 'UPDATE_TEAM_PROFILE', profile: { ...profile, managerName: 'Coach Amir' } })
    assert.deepEqual(game.currentMatch, report)
    assert.deepEqual(restore(game), game)
    game = gameReducer(game, { type: 'ADVANCE_WEEK' })
  }
  game = gameReducer(game, { type: 'START_NEW_SEASON' })
  assert.equal(game.profile.teamName, profile.teamName)
  assert.equal(game.profile.managerName, 'Coach Amir')
  assert.deepEqual(restore(game), game)
})

test('profile validation rejects blank, long or control-character names and preserves old saves', () => {
  const game = createInitialGame()
  assert.deepEqual(restore(game), game)
  for (const name of ['', ' ', ' X', 'X'.repeat(33), 'A\nB', 42, null]) {
    for (const field of ['teamName', 'managerName']) {
      const profile = { teamName: 'Scarlet Circuit', managerName: 'Amir', [field]: name }
      assert.equal(gameReducer(game, { type: 'UPDATE_TEAM_PROFILE', profile }), game)
      assert.equal(restore({ ...game, profile }), null)
    }
  }
  const profile = { teamName: 'Bara & Co.', managerName: 'Nur Aisyah' }
  assert.deepEqual(restore({ ...game, profile }).profile, profile)
})
