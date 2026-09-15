import type { MatchEvent } from '../types/match.ts'

export function estimatedGoldLead(event?: MatchEvent): number {
  // A readable estimate of advantage, not a simulated economy or an extra match modifier.
  return Math.round((event?.state?.advantage ?? event?.momentum ?? 0) * 100)
}

export function matchTime(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
}

export type HighlightToken = { text: string; kind: 'player' | 'opponent' | 'champion' | 'keyword' }
export function splitCommentary(text: string, tokens: HighlightToken[]): { text: string; kind?: HighlightToken['kind'] }[] {
  const ordered = tokens.filter((token) => token.text.length > 0).sort((a, b) => b.text.length - a.text.length)
  const parts: { text: string; kind?: HighlightToken['kind'] }[] = []
  let plain = ''
  for (let index = 0; index < text.length;) {
    const token = ordered.find((entry) => text.slice(index, index + entry.text.length).toLowerCase() === entry.text.toLowerCase()
      && (index === 0 || !/[\p{L}\p{N}_]/u.test(text[index - 1]))
      && !/[\p{L}\p{N}_]/u.test(text[index + entry.text.length] ?? ''))
    if (token) {
      if (plain) parts.push({ text: plain })
      plain = ''
      parts.push({ text: text.slice(index, index + token.text.length), kind: token.kind })
      index += token.text.length
    } else { plain += text[index]; index += 1 }
  }
  if (plain) parts.push({ text: plain })
  return parts
}
