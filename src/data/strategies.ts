import type { Strategy } from '../types/domain.ts'

export const strategies: Strategy[] = [
  {
    id: 'early-aggression', name: 'Early Aggression',
    description: 'Apply early lane pressure and seek favourable fights before opponents settle.',
    supportingFocuses: ['Assassin', 'Burst', 'Lane Pressure', 'Engage'],
  },
  {
    id: 'objective-control', name: 'Objective Control',
    description: 'Move together and prepare favourable positions around major objectives.',
    supportingFocuses: ['Vanguard', 'Utility', 'Control'],
  },
  {
    id: 'late-game-scaling', name: 'Late-Game Scaling',
    description: 'Take measured risks early and prepare for stronger late-game team fights.',
    supportingFocuses: ['Frontline', 'Hypercarry', 'Protection'],
  },
  {
    id: 'protect-the-carry', name: 'Protect the Carry',
    description: 'Coordinate the frontline and support around keeping the carry safe in fights.',
    supportingFocuses: ['Frontline', 'Utility', 'Hypercarry', 'Protection'],
  },
]
