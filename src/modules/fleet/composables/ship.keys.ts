import type { ShipsParams } from '../schemas/ships.schema'

export const shipKeys = {
  list: (params: ShipsParams) => ['ships', 'list', params] as const,
  detail: (symbol: string) => ['ships', 'detail', symbol] as const,
}
