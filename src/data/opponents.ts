import type { Opponent } from '../types/domain.ts'

export const opponents: Opponent[] = [
  {
    id: 'cinderwake-five', name: 'Cinderwake Five',
    identity: 'An aggressive team that commits players to early lane skirmishes.',
    overallStrength: 66, preferredStrategyId: 'early-aggression',
    strongPhase: 'Early game', weakPhase: 'Late game',
    notablePlayer: { name: 'Vessa Keld', role: 'Jungle', description: 'Sets a fast pace with bold opening calls.' },
    exploitableWeakness: 'Overcommits to chasing isolated targets and struggles to regroup after failed attacks.',
    draftingTendency: 'Favours assassins, burst and lane pressure over late-game protection.',
  },
  {
    id: 'meridian-keepers', name: 'Meridian Keepers',
    identity: 'A methodical team that organises rotations around major objectives.',
    overallStrength: 72, preferredStrategyId: 'objective-control',
    strongPhase: 'Mid game', weakPhase: 'Early game',
    notablePlayer: { name: 'Daro Mervin', role: 'Mid', description: 'Reads rotations and organises the next objective setup.' },
    exploitableWeakness: 'Predictable group rotations can leave a side lane unattended.',
    draftingTendency: 'Favours control and utility champions for coordinated team fights.',
  },
  {
    id: 'stillharbour-ward', name: 'Stillharbour Ward',
    identity: 'A defensive team that gives ground early to preserve its late-game carry.',
    overallStrength: 70, preferredStrategyId: 'late-game-scaling',
    strongPhase: 'Late game', weakPhase: 'Early game',
    notablePlayer: { name: 'Liora Tessel', role: 'Carry', description: 'Stays composed and finds safe positions in long matches.' },
    exploitableWeakness: 'Concedes early objectives while waiting for safer fights.',
    draftingTendency: 'Pairs a hypercarry with frontline and protection champions.',
  },
  {
    id: 'crosswind-parallax', name: 'Crosswind Parallax',
    identity: 'An unpredictable team that shifts flexible champions between roles and changes its point of pressure.',
    overallStrength: 68, preferredStrategyId: 'protect-the-carry',
    strongPhase: 'Mid game', weakPhase: 'Late game',
    notablePlayer: { name: 'Renn Oskari', role: 'Support', description: 'Alternates between roaming calls and returning to cover the carry.' },
    exploitableWeakness: 'Frequent changes of plan leave players separated when decisive late fights begin.',
    draftingTendency: 'Favours Brannoch, Kelroth and Aurelis to keep role assignments flexible.',
  },
]
