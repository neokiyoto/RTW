import type { GameState } from '../types/gameState.ts'
import { getMatchReadinessErrors } from './matchPreparation.ts'

export function getWeeklyFlow(game: GameState) {
  if (game.seasonStatus === 'complete') return { step: 3, title: 'Your season is complete', description: 'See how you finished and begin another season with this roster.', action: 'See season results', to: '/standings' }
  if (game.currentMatch) return { step: 2, title: 'Your match is ready to watch', description: 'Follow the action, then apply the result to begin next week.', action: 'Watch match & result', to: '/match' }
  if (!game.weeklyReport) return { step: 0, title: 'First, prepare your players', description: 'Check their condition and choose one activity for this week.', action: 'Choose weekly activity', to: '/dashboard#weekly-activity' }
  if (getMatchReadinessErrors(game).length) return { step: 1, title: 'Next, set your match plan', description: 'Give each player a champion and choose how your team will play.', action: 'Choose line-up & strategy', to: '/match' }
  return { step: 2, title: 'Your team is ready', description: 'Your activity, five champions and strategy are set. Time for the match.', action: 'Go to match', to: '/match' }
}
