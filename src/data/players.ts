import type { Player } from '../types/domain.ts'

export const initialRoster: Player[] = [
  {
    id: 'player-taren', name: 'Taren Vossel', role: 'Top', roleFocus: 'Frontline',
    playstyle: 'Patient', preferredChampionIds: ['brannoch', 'orravel'],
    mechanics: 62, gameSense: 72, teamwork: 74, leadership: 65,
    morale: 75, fatigue: 10, potential: 72, matchesPlayed: 48,
  },
  {
    id: 'player-nemi', name: 'Nemi Corven', role: 'Jungle', roleFocus: 'Assassin',
    playstyle: 'Aggressive', preferredChampionIds: ['nyssik', 'kelroth'],
    mechanics: 76, gameSense: 61, teamwork: 58, leadership: 45,
    morale: 78, fatigue: 15, potential: 88, matchesPlayed: 12,
  },
  {
    id: 'player-iver', name: 'Iver Dalmere', role: 'Mid', roleFocus: 'Control',
    playstyle: 'Balanced', preferredChampionIds: ['threnna', 'iskavel'],
    mechanics: 70, gameSense: 75, teamwork: 68, leadership: 60,
    morale: 72, fatigue: 12, potential: 80, matchesPlayed: 32,
  },
  {
    id: 'player-sela', name: 'Sela Rennick', role: 'Carry', roleFocus: 'Hypercarry',
    playstyle: 'Patient', preferredChampionIds: ['serrune', 'aurelis'],
    mechanics: 74, gameSense: 60, teamwork: 65, leadership: 40,
    morale: 70, fatigue: 8, potential: 92, matchesPlayed: 6,
  },
  {
    id: 'player-oren', name: 'Oren Valsett', role: 'Support', roleFocus: 'Engage',
    playstyle: 'Balanced', preferredChampionIds: ['tovren', 'mirethi'],
    mechanics: 56, gameSense: 78, teamwork: 82, leadership: 86,
    morale: 80, fatigue: 10, potential: 64, matchesPlayed: 110,
  },
]
