import type { SystemsParams } from '../schemas/systems.schema'

export const systemKeys = {
  list: (params: SystemsParams) => ['systems', 'list', params] as const,
  detail: (symbol: string) => ['systems', 'detail', symbol] as const,
}
