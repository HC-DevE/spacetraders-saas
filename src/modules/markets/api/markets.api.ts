import { ApiError } from '@/shared/api/api-error'
import { getJson } from '@/shared/api/http'

import { marketResponseSchema, type Market } from '../schemas/market.schema'

export async function getMarket(
  token: string,
  systemSymbol: string,
  waypointSymbol: string,
  signal?: AbortSignal,
): Promise<Market> {
  const response = await getJson(
    `/systems/${encodeURIComponent(systemSymbol)}/waypoints/${encodeURIComponent(waypointSymbol)}/market`,
    token,
    signal,
  )

  const result = marketResponseSchema.safeParse(response)

  if (!result.success) {
    throw new ApiError(
      'invalid-response',
      'The market response is incomplete or invalid. Please try again.',
    )
  }

  if (result.data.data.symbol !== waypointSymbol) {
    throw new ApiError(
      'invalid-response',
      'The server returned a market for a different waypoint. Please try again.',
    )
  }

  return result.data.data
}
