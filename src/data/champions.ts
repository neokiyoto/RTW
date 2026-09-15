import type { Champion } from '../types/domain.ts'

export const champions: Champion[] = [
  {
    id: 'brannoch', name: 'Brannoch', primaryRole: 'Top', secondaryRole: 'Jungle',
    archetype: 'Frontline', earlyGame: 65, lateGame: 68, teamFighting: 82, difficulty: 35,
  },
  {
    id: 'velsari', name: 'Velsari', primaryRole: 'Top',
    archetype: 'Duelist', earlyGame: 78, lateGame: 65, teamFighting: 45, difficulty: 70,
  },
  {
    id: 'orravel', name: 'Orravel', primaryRole: 'Top',
    archetype: 'Split-Pusher', earlyGame: 52, lateGame: 83, teamFighting: 40, difficulty: 60,
  },
  {
    id: 'kelroth', name: 'Kelroth', primaryRole: 'Jungle', secondaryRole: 'Support',
    archetype: 'Utility', earlyGame: 68, lateGame: 62, teamFighting: 80, difficulty: 45,
  },
  {
    id: 'nyssik', name: 'Nyssik', primaryRole: 'Jungle',
    archetype: 'Assassin', earlyGame: 88, lateGame: 48, teamFighting: 50, difficulty: 80,
  },
  {
    id: 'aurelis', name: 'Aurelis', primaryRole: 'Mid', secondaryRole: 'Carry',
    archetype: 'Artillery', earlyGame: 50, lateGame: 85, teamFighting: 76, difficulty: 75,
  },
  {
    id: 'threnna', name: 'Threnna', primaryRole: 'Mid',
    archetype: 'Control', earlyGame: 62, lateGame: 78, teamFighting: 86, difficulty: 55,
  },
  {
    id: 'iskavel', name: 'Iskavel', primaryRole: 'Mid',
    archetype: 'Burst', earlyGame: 84, lateGame: 58, teamFighting: 65, difficulty: 65,
  },
  {
    id: 'serrune', name: 'Serrune', primaryRole: 'Carry',
    archetype: 'Hypercarry', earlyGame: 38, lateGame: 94, teamFighting: 88, difficulty: 70,
  },
  {
    id: 'draveli', name: 'Draveli', primaryRole: 'Carry',
    archetype: 'Lane Pressure', earlyGame: 86, lateGame: 60, teamFighting: 62, difficulty: 45,
  },
  {
    id: 'tovren', name: 'Tovren', primaryRole: 'Support',
    archetype: 'Engage', earlyGame: 80, lateGame: 58, teamFighting: 84, difficulty: 50,
  },
  {
    id: 'mirethi', name: 'Mirethi', primaryRole: 'Support',
    archetype: 'Protection', earlyGame: 48, lateGame: 88, teamFighting: 82, difficulty: 30,
  },
]
