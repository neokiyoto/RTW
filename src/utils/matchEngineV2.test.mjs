import assert from 'node:assert/strict'
import test from 'node:test'
import { createInitialGame } from './createInitialGame.ts'
import { gameReducer } from '../reducers/gameReducer.ts'
import { simulateMatch, championCompatibility } from './simulateMatch.ts'
import { legacySimulateMatch } from './legacySimulateMatch.ts'
import { createMatchRandom } from './matchRandom.ts'
import { validateSave } from './validateSave.ts'
import { champions } from '../data/champions.ts'
import { strategies } from '../data/strategies.ts'
import { opponents } from '../data/opponents.ts'
import { seasonSchedule } from './season.ts'

function ready() {
  const game = gameReducer(createInitialGame(), { type: 'RESOLVE_WEEKLY_ACTIVITY', choice: { id: 'rest' }, rolls: { development: 0, event: 0.9, player: 0 } })
  game.championAssignments = { Top: 'brannoch', Jungle: 'nyssik', Mid: 'threnna', Carry: 'serrune', Support: 'mirethi' }
  game.selectedStrategyId = 'objective-control'
  return game
}
function sample(game, count = 300, opponent = opponents[1]) {
  const random = createMatchRandom(20260915)
  return Array.from({ length: count }, () => simulateMatch(game, { timing: random(), player: random(), outcome: random() }, opponent))
}
const wins = (reports) => reports.filter((report) => report.result === 'victory').length
const countType = (reports, type) => reports.flatMap((report) => report.events.filter((event) => event.kind === 'setup' && event.encounter === type)).length
const load = (game) => validateSave(JSON.parse(JSON.stringify({ version: 1, game })))

test('V2 chains contain evolving, bounded snapshots, chronological seconds and actual roster involvement', () => {
  const game = ready()
  for (const report of sample(game, 100)) {
    assert.equal(report.engineVersion, 2)
    assert.ok(report.events.length >= 20 && report.events.length <= 35)
    assert.equal(report.events.filter((event) => event.kind === 'turning-point').length, 1)
    assert.ok(report.events.some((event) => event.encounter === 'objective'))
    assert.equal(report.result, report.margin > 0 ? 'victory' : 'defeat')
    const phases = new Set()
    const people = new Set()
    for (const [index, event] of report.events.entries()) {
      assert.ok(index === 0 || event.seconds > report.events[index - 1].seconds)
      assert.equal(event.state.seconds, event.seconds)
      assert.ok(Math.abs(event.state.momentum) <= 25)
      assert.ok(Math.abs(event.state.mapControl) <= 25)
      assert.ok(Math.abs(event.state.objectiveControl) <= 5)
      assert.ok(Math.abs(event.state.advantage) <= 100)
      assert.ok(!event.text.includes('undefined') && !event.text.includes('{'))
      people.add(event.playerId)
      phases.add(event.state.phase)
      assert.ok(game.players.some((player) => event.playerId === player.id))
      if (event.kind === 'resolution') assert.ok(report.events[index - 1].chain === event.chain && report.events[index - 1].kind === 'reaction')
    }
    assert.equal(phases.size, 6)
    assert.ok(people.size >= 4)
    assert.equal(report.events.at(-1).encounter, 'final')
    assert.equal(report.events.at(-1).state.advantage, report.margin)
  }
})

test('a modest ability improvement wins more often but retains losses in a seeded sample', () => {
  const base = ready()
  const stronger = structuredClone(base)
  stronger.players.forEach((player) => { for (const key of ['mechanics', 'gameSense', 'teamwork', 'leadership']) player[key] += 3 })
  const baseWins = wins(sample(base))
  const betterWins = wins(sample(stronger))
  console.log(`Seeded balance (300 matches): baseline ${baseWins}, +3 ability ${betterWins}`)
  assert.ok(baseWins > 0 && baseWins < 300)
  assert.ok(betterWins > baseWins && betterWins < 300)
})

test('condition reduces success and compatible champions improve the same player', () => {
  const fresh = ready()
  const tired = structuredClone(fresh)
  tired.players.forEach((player) => { player.fatigue = 75; player.morale = 35 })
  assert.ok(wins(sample(fresh)) > wins(sample(tired)))
  const player = fresh.players.find((entry) => entry.role === 'Carry')
  const champion = champions.find((entry) => entry.id === 'serrune')
  const strategy = strategies.find((entry) => entry.id === 'late-game-scaling')
  assert.ok(championCompatibility(player, champion, strategy) > championCompatibility({ ...player, preferredChampionIds: [], roleFocus: 'Lane Pressure', playstyle: 'Aggressive' }, champion, strategy))
  const unfamiliar = structuredClone(fresh)
  unfamiliar.players.forEach((entry) => { entry.preferredChampionIds = [] })
  assert.ok(wins(sample(fresh)) > wins(sample(unfamiliar)))
})

test('strategy changes the types of attempted play, not just text labels', () => {
  const aggressive = sample({ ...ready(), selectedStrategyId: 'early-aggression' }, 100)
  const objectives = sample({ ...ready(), selectedStrategyId: 'objective-control' }, 100)
  const protect = sample({ ...ready(), selectedStrategyId: 'protect-the-carry' }, 100)
  const scaling = sample({ ...ready(), selectedStrategyId: 'late-game-scaling' }, 100)
  assert.ok(countType(aggressive, 'invade') > countType(objectives, 'invade'))
  assert.ok(countType(objectives, 'objective') > countType(aggressive, 'objective'))
  assert.ok(countType(protect, 'protection') > countType(aggressive, 'protection'))
  assert.ok(countType(scaling, 'recovery') > countType(aggressive, 'recovery'))
})

test('opponent behaviour differs at equal strength and names its notable player', () => {
  const reports = opponents.map((opponent) => sample(ready(), 100, { ...opponent, overallStrength: 72 }))
  assert.ok(countType(reports[0], 'invade') > countType(reports[2], 'invade'))
  assert.ok(countType(reports[1], 'objective') > countType(reports[0], 'objective'))
  assert.ok(countType(reports[2], 'recovery') > countType(reports[0], 'recovery'))
  for (const [index, matches] of reports.entries()) assert.ok(matches.some((report) => report.events.some((event) => event.text.includes(opponents[index].notablePlayer.name))))
})

test('momentum reversals, comebacks and thrown leads emerge across a fixed seed suite', () => {
  const reports = sample(ready(), 500)
  assert.ok(reports.some((report) => report.events.some((event) => event.momentum > 4) && report.events.some((event) => event.momentum < -4)))
  assert.ok(reports.some((report) => report.result === 'victory' && report.events.slice(0, -3).some((event) => event.state.advantage < -10)))
  assert.ok(reports.some((report) => report.result === 'defeat' && report.events.slice(0, -3).some((event) => event.state.advantage > 10)))
})

test('one favourable major event cannot rescue an overwhelming ability gap', () => {
  const weak = ready()
  weak.players.forEach((player) => Object.assign(player, { mechanics: 10, gameSense: 10, teamwork: 10, leadership: 10 }))
  const strong = ready()
  strong.players.forEach((player) => Object.assign(player, { mechanics: 95, gameSense: 95, teamwork: 95, leadership: 95 }))
  for (const opponent of opponents) {
    assert.equal(simulateMatch(weak, { timing: 0.7, player: 0.3, outcome: 0 }, opponent).result, 'defeat')
    assert.equal(simulateMatch(strong, { timing: 0.7, player: 0.3, outcome: 0.999 }, opponent).result, 'victory')
  }
})

test('V1 and V2 saved reports preserve exact results and can still apply consequences once', () => {
  for (const simulate of [legacySimulateMatch, simulateMatch]) {
    const game = ready()
    game.currentMatch = simulate(game, { timing: 0.5, player: 0.5, outcome: 0.3 })
    const restored = load(game)
    assert.deepEqual(restored, game)
    const advanced = gameReducer(restored, { type: 'ADVANCE_WEEK' })
    assert.equal(advanced.week, 2)
    assert.equal(advanced.matchHistory[0].result, game.currentMatch.result)
    assert.equal(advanced.players[0].matchesPlayed, game.players[0].matchesPlayed + 1)
    assert.equal(gameReducer(advanced, { type: 'ADVANCE_WEEK' }), advanced)
    assert.deepEqual(load(advanced), advanced)
  }
})

test('unsupported engine versions and corrupt snapshots are rejected without replacing a save', () => {
  const game = ready()
  game.currentMatch = simulateMatch(game, { timing: 0.5, player: 0.5, outcome: 0.3 })
  for (const change of [
    (report) => { report.engineVersion = 3 },
    (report) => { delete report.engineVersion },
    (report) => { report.events[3].state.advantage = 999 },
    (report) => { report.events[3].seconds = 0 },
    (report) => { report.events[3].text = 'Made up' },
  ]) {
    const bad = structuredClone(game)
    change(bad.currentMatch)
    assert.equal(load(bad), null)
  }
})

test('every strategy and opponent survives extreme condition and save round trips', () => {
  const random = createMatchRandom(9152026)
  for (const opponent of opponents) {
    for (const strategy of strategies) {
      for (const condition of [0, 50, 100]) {
        const game = ready()
        const weekIndex = seasonSchedule.findIndex((week) => week.opponentId === opponent.id)
        game.matchHistory = seasonSchedule.slice(0, weekIndex).map((week, index) => ({ week: index + 1, opponentId: week.opponentId, result: 'victory', margin: 1 }))
        game.week = weekIndex + 1
        game.wins = weekIndex
        game.selectedStrategyId = strategy.id
        game.players.forEach((player) => { player.fatigue = condition; player.morale = 100 - condition })
        for (let run = 0; run < 10; run += 1) {
          const report = simulateMatch(game, { timing: random(), player: random(), outcome: random() })
          assert.ok(report)
          assert.ok(Number.isFinite(report.margin))
          assert.equal(report.result, report.margin > 0 ? 'victory' : 'defeat')
          assert.equal(report.opponentId, opponent.id)
          assert.ok(report.events.length >= 20 && report.events.length <= 35)
          assert.equal(report.events.filter((event) => event.kind === 'turning-point').length, 1)
          assert.deepEqual(load({ ...game, currentMatch: report }), { ...game, currentMatch: report })
        }
      }
    }
  }
})
