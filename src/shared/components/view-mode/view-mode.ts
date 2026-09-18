export const viewModes = {
  table: 'table',
  cards: 'cards',
} as const

export type ViewMode = (typeof viewModes)[keyof typeof viewModes]

export function parseViewMode(value: unknown): ViewMode {
  return value === viewModes.cards ? viewModes.cards : viewModes.table
}
