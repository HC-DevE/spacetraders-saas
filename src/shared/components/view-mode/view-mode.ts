export const viewModes = {
  table: 'table',
  cards: 'cards',
} as const

export type ViewMode = (typeof viewModes)[keyof typeof viewModes]
