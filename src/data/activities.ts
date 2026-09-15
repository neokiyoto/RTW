import type { ActivityId } from '../types/management.ts'

export const activities: { id: ActivityId; name: string; description: string }[] = [
  { id: 'team-training', name: 'Team Training', description: 'Each player gains 1 Teamwork and 8 Fatigue. Team synergy rises by 4.' },
  { id: 'individual-training', name: 'Individual Training', description: 'One player gains 12 Fatigue and a chance to improve Mechanics or Game Sense by 1. Higher Potential and lower current ability improve that chance.' },
  { id: 'opponent-analysis', name: 'Opponent Analysis', description: 'Reveal the next opponent’s tactical profile. No permanent ability gains.' },
  { id: 'rest', name: 'Rest', description: 'Each player loses 15 Fatigue and gains 3 Morale. No permanent ability gains.' },
  { id: 'team-building', name: 'Team Building', description: 'Each player gains 6 Morale. Team synergy rises by 5. No permanent ability gains.' },
]
