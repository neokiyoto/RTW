export type ActivityId = 'team-training' | 'individual-training' | 'opponent-analysis' | 'rest' | 'team-building'
export type TrainingAttribute = 'mechanics' | 'gameSense'

export type WeeklyActivity =
  | { id: 'individual-training'; playerId: string; attribute: TrainingAttribute }
  | { id: Exclude<ActivityId, 'individual-training'> }

export type WeeklyEventId = 'practice-confidence' | 'long-review' | 'shared-plan'

export type WeeklyReport = {
  activitySummary: string
  event: { id: WeeklyEventId; playerId: string | null; summary: string }
  changes: string[]
}

// Draw these once outside the reducer; supplying them keeps transitions repeatable.
export type WeeklyRolls = { development: number; event: number; player: number }
