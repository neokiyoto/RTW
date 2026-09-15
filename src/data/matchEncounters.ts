import type { EncounterType } from '../types/match.ts'
import type { Role, RoleFocus, StrategyId } from '../types/domain.ts'

export type EncounterDefinition = {
  label: string
  roles: Role[]
  focuses: RoleFocus[]
  impact: number
  teamOpen: string[]
  opponentOpen: string[]
  teamResponse: string[]
  opponentResponse: string[]
  teamWin: string[]
  opponentWin: string[]
}

// Braced names are filled from the selected players, champions and opponent.
export const matchEncounters: Record<EncounterType, EncounterDefinition> = {
  lane: {
    label: 'Lane pressure', roles: ['Top', 'Mid', 'Carry'], focuses: ['Duelist', 'Lane Pressure', 'Split-Pusher'], impact: 2,
    teamOpen: ['{actor} brings {champion} forward in the {lane}, testing how much ground the opposing laner will give.', '{actor} uses {champion} to pin the {lane} back; {partner} watches the route behind.'],
    opponentOpen: ['{enemy} pushes into the {lane}. {actor} gives {champion} room to turn rather than getting trapped.', '{enemy} crowds the {lane}, forcing {actor} on {champion} to choose where to hold.'],
    teamResponse: ['{partner} shows nearby, giving {actor} a safe angle to answer the pressure.', '{actor} catches the next movement; {partner} closes the exposed route.'],
    opponentResponse: ['{enemy} brings another player across, cutting off {actor} from a clean advance.', '{actor} finds the lane covered. {enemy} refuses to leave an isolated target.'],
    teamWin: ['{actor} wins the exchange on {champion}. {partner} moves through the space left behind.', '{actor} forces the opposing laner to reset; {champion} now controls the approach.'],
    opponentWin: ['{actor} has to pull {champion} back. {enemy} takes the route out of the lane.', '{partner} helps {actor} escape the squeeze, but the lane belongs to {enemy} for now.'],
  },
  rotation: {
    label: 'Rotation', roles: ['Jungle', 'Mid', 'Support'], focuses: ['Roaming', 'Utility', 'Control'], impact: 3,
    teamOpen: ['{actor} takes {champion} through the river towards {partner}; the pair are looking for a two-sided entry.', '{actor} leaves the lane on {champion}, asking {partner} to hold the opposing attention.'],
    opponentOpen: ['{notable} directs {enemy} across the river. {actor} on {champion} spots the change of direction.', '{enemy} moves two players out of sight; {actor} asks {partner} to cover the crossing.'],
    teamResponse: ['{partner} moves first, meeting {actor} before the opposing rotation arrives.', '{actor} reads the crossing and turns {champion} towards the unguarded path.'],
    opponentResponse: ['{notable} anticipates the meeting point. {actor} must take a longer route.', '{enemy} blocks the crossing before {partner} can join {actor}.'],
    teamWin: ['{actor} and {partner} arrive together, forcing {enemy} off the river route.', '{champion} reaches the flank with {partner} alongside; {enemy} retreats to avoid being surrounded.'],
    opponentWin: ['The meeting comes too late. {actor} turns {champion} away as {enemy} claims the crossing.', '{partner} has to cover the retreat; {enemy} reaches the next position ahead of {actor}.'],
  },
  invade: {
    label: 'Incursion', roles: ['Jungle', 'Support'], focuses: ['Assassin', 'Engage', 'Vanguard'], impact: 4,
    teamOpen: ['{actor} takes {champion} beyond the river, with {partner} following to deny an escape route.', '{actor} commits {champion} to a forward incursion; {partner} moves up to keep the path open.'],
    opponentOpen: ['{notable} leads {enemy} into your side of the map. {actor} sets {champion} near the exit.', '{enemy} presses past the river; {actor} signals {partner} to stay close before answering.'],
    teamResponse: ['{partner} cuts across the retreat route, letting {actor} turn the incursion into a trap.', '{actor} tracks the forward players and guides {partner} into the gap behind them.'],
    opponentResponse: ['{enemy} collapses towards {champion}; {partner} is forced to stop short.', '{notable} keeps the group together, denying {actor} an isolated opponent.'],
    teamWin: ['{actor} wins the forward exchange on {champion}; your team takes control beyond the river.', '{partner} reaches {actor} in time. The opposing forward group is forced all the way back.'],
    opponentWin: ['The incursion turns against {actor}. {champion} escapes, but {enemy} follows into the vacated space.', '{actor} cannot hold the entry. {partner} covers the retreat as {enemy} moves forward.'],
  },
  duel: {
    label: 'Individual exchange', roles: ['Top', 'Mid', 'Carry'], focuses: ['Duelist', 'Burst', 'Assassin', 'Artillery'], impact: 3,
    teamOpen: ['{actor} isolates a short exchange on {champion}, asking {partner} to watch for reinforcements.', '{actor} edges {champion} into range, challenging the opposing player to stay.'],
    opponentOpen: ['{enemy} singles out {actor}. {champion} has little room before the next exchange.', '{actor} on {champion} is challenged in the {lane}; {partner} starts moving closer.'],
    teamResponse: ['{actor} keeps the angle narrow, making the opposing commitment easier to read.', '{partner} blocks the follow-up, leaving {actor} room to execute the exchange.'],
    opponentResponse: ['The opposing player changes the angle; {actor} must react before {partner} arrives.', '{enemy} times the challenge around {partner} being out of position.'],
    teamWin: ['{actor} outmanoeuvres the opponent on {champion} and opens the lane for the team.', '{champion} wins the exchange under {actor}’s control; the opposition has to abandon the position.'],
    opponentWin: ['{actor} loses the exchange and withdraws {champion}. {partner} prevents a further chase.', '{enemy} gets the better of {actor}; your team gives up the nearby approach to regroup.'],
  },
  objective: {
    label: 'Objective contest', roles: ['Jungle', 'Mid', 'Support'], focuses: ['Control', 'Utility', 'Vanguard'], impact: 5,
    teamOpen: ['{actor} positions {champion} at the objective entrance while {partner} covers the river.', '{actor} starts the objective setup on {champion}; {partner} checks the route the opposition must use.'],
    opponentOpen: ['{notable} assembles {enemy} around the objective. {actor} looks for an entry with {champion}.', '{enemy} occupies the objective approach; {actor} asks {partner} to probe the far side.'],
    teamResponse: ['{partner} reaches the far entrance. {actor} now has two angles into the contest.', '{actor} finds a safe line through the setup and brings {partner} into position.'],
    opponentResponse: ['{enemy} closes the entrance before {actor} can settle; {partner} is kept outside.', '{notable} calls the turn onto {champion}, disrupting {actor}’s setup.'],
    teamWin: ['{actor} holds the approach on {champion}. Your team secures the objective and claims the next advance.', '{partner} keeps the contest clear while {actor} finishes the objective; your team gains lasting control.'],
    opponentWin: ['{actor} cannot break the screen. {enemy} secures the objective as {partner} calls the retreat.', '{enemy} wins the contest; {actor} pulls {champion} away before the escape route closes.'],
  },
  recovery: {
    label: 'Defensive reset', roles: ['Support', 'Top', 'Mid'], focuses: ['Frontline', 'Protection', 'Control'], impact: 3,
    teamOpen: ['{actor} draws {champion} into a compact defensive line, buying time for {partner} to reset.', '{actor} calls a patient hold on {champion}; {partner} waits for the opposing advance to stretch.'],
    opponentOpen: ['{enemy} slows the advance and forms a defensive line. {actor} tests its edge with {champion}.', '{notable} calls {enemy} back into formation; {actor} asks {partner} to keep the exits watched.'],
    teamResponse: ['{partner} steadies the line, giving {actor} room to turn on the forward player.', '{actor} resists the chase and waits until {partner} can answer together.'],
    opponentResponse: ['{enemy} refuses to overextend; {actor} finds no easy route back into the map.', '{notable} orders a measured move that separates {actor} from {partner}.'],
    teamWin: ['{actor} and {partner} push the opposition off the approach. Your team earns breathing room.', '{champion} holds long enough for {partner} to arrive; {actor} turns the hold into a route forward.'],
    opponentWin: ['{enemy} keeps control of the approach. {actor} must reset {champion} even further back.', '{actor} cannot open the compact line; {enemy} regroups with the position intact.'],
  },
  protection: {
    label: 'Carry positioning', roles: ['Carry', 'Support', 'Top'], focuses: ['Protection', 'Frontline', 'Hypercarry', 'Artillery'], impact: 4,
    teamOpen: ['{actor} positions {champion} around {carry}, with {partner} watching the nearest flank.', '{carry} asks for room to work; {actor} moves {champion} to keep the fight in front of the team.'],
    opponentOpen: ['{enemy} angles towards {carry}. {actor} moves {champion} across to meet the threat.', '{notable} turns {enemy} towards the carry position; {actor} calls {partner} back into cover.'],
    teamResponse: ['{partner} shuts down the flank. {carry} can stay in the exchange behind {actor}.', '{actor} keeps {champion} in the line of approach while {carry} changes position.'],
    opponentResponse: ['{enemy} attacks from a second angle, forcing {carry} away from the planned position.', '{actor} has to turn {champion} too far; {notable} opens another route towards {carry}.'],
    teamWin: ['{carry} stays involved throughout the fight. {actor}’s cover turns that time into a strong advance.', '{actor} and {partner} keep the approach clear; {carry} drives {enemy} from the position.'],
    opponentWin: ['{carry} is forced out of the exchange. {actor} pulls {champion} back to prevent a further collapse.', '{enemy} breaks the protective line; {partner} helps {carry} retreat while {actor} covers the route.'],
  },
  teamfight: {
    label: 'Team fight', roles: ['Support', 'Carry', 'Top'], focuses: ['Engage', 'Frontline', 'Hypercarry', 'Control'], impact: 5,
    teamOpen: ['{actor} brings {champion} to the front as {partner} calls the team into a wider formation.', '{actor} sees the opposing line separate and moves {champion} forward with {partner}.'],
    opponentOpen: ['{notable} brings {enemy} together for a committed fight; {actor} readies {champion} for the response.', '{enemy} turns as a group. {actor} signals {partner} before the lines meet.'],
    teamResponse: ['{partner} follows the call immediately; {actor} has the support to hold the engagement.', '{actor} reads the first commitment and turns {champion} towards the exposed side.'],
    opponentResponse: ['{enemy} changes direction together, leaving {actor} with a difficult entry.', '{partner} is forced to stop short as {enemy} turns onto {champion}.'],
    teamWin: ['{actor} and {partner} win the extended exchange. {enemy} breaks formation and yields the route forward.', '{champion} stays at the centre of the fight; {actor} helps the team force a full opposing retreat.'],
    opponentWin: ['{enemy} wins the fight. {actor} withdraws {champion} while {partner} gathers the scattered team.', '{actor} cannot sustain the engagement; {notable} leads {enemy} through the broken line.'],
  },
  final: {
    label: 'Final engagement', roles: ['Carry', 'Support', 'Top'], focuses: ['Hypercarry', 'Frontline', 'Protection', 'Engage'], impact: 6,
    teamOpen: ['{actor} leads {champion} into the final approach, with {partner} keeping the team connected.', '{actor} advances {champion} towards the last defensive line. {partner} moves up behind the play.'],
    opponentOpen: ['{enemy} reaches the final approach. {actor} sets {champion} for one last coordinated hold.', '{notable} brings {enemy} towards the closing fight; {actor} calls {partner} into the defensive line.'],
    teamResponse: ['{partner} finds the opening beside {actor}; the whole team can enter the final exchange together.', '{actor} reads the opposing commitment and turns {champion} towards the exposed route.'],
    opponentResponse: ['{enemy} closes the space around {actor}; {partner} struggles to keep the line connected.', '{notable} times the final turn, forcing {actor} and {partner} to fight from separate angles.'],
    teamWin: ['{actor} holds the decisive position with {champion}. {partner} follows through and your team closes the match.', '{actor} and {partner} break the last opposing line. Your team completes the final push.'],
    opponentWin: ['{enemy} breaks through the last exchange. {actor} cannot bring {champion} back into position before the match is closed.', '{notable} leads the winning advance. {actor} and {partner} are forced apart as {enemy} closes the match.'],
  },
}

export const strategyEncounters: Record<StrategyId, EncounterType[]> = {
  'early-aggression': ['lane', 'invade', 'invade', 'rotation', 'duel', 'teamfight'],
  'objective-control': ['rotation', 'objective', 'objective', 'rotation', 'lane', 'teamfight'],
  'late-game-scaling': ['recovery', 'recovery', 'lane', 'protection', 'duel', 'teamfight'],
  'protect-the-carry': ['protection', 'protection', 'recovery', 'teamfight', 'rotation', 'lane'],
}

// Structured interpretations of the existing drafting tendencies and weaknesses.
export const opponentApproaches: Record<string, { favoured: EncounterType[]; exposedBy: EncounterType }> = {
  'cinderwake-five': { favoured: ['invade', 'duel', 'lane'], exposedBy: 'recovery' },
  'meridian-keepers': { favoured: ['objective', 'rotation'], exposedBy: 'duel' },
  'stillharbour-ward': { favoured: ['protection', 'recovery'], exposedBy: 'objective' },
  'crosswind-parallax': { favoured: ['rotation', 'invade', 'duel'], exposedBy: 'teamfight' },
}
