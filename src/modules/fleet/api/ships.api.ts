import { ApiError } from '@/shared/api/api-error'
import { apiEndpoints } from '@/shared/api/endpoints'
import { getJson } from '@/shared/api/http'

import {
  shipsParamsSchema,
  shipsResponseSchema,
  type ShipsParams,
  type ShipsResponse,
} from '../schemas/ships.schema'
import { shipResponseSchema, type Ship } from '../schemas/ship.schema'

export async function getShips(
  token: string,
  params: ShipsParams,
  signal?: AbortSignal,
): Promise<ShipsResponse> {
  const pagination = shipsParamsSchema.parse(params)

  const search = new URLSearchParams({
    page: String(pagination.page),
    limit: String(pagination.limit),
  })

  const response = await getJson(`${apiEndpoints.ships.list}?${search.toString()}`, token, signal)

  const result = shipsResponseSchema.safeParse(response)

  if (!result.success) {
    throw new ApiError(
      'invalid-response',
      'The ships response is incomplete or invalid. Please try again.',
    )
  }

  if (result.data.meta.page !== pagination.page || result.data.meta.limit !== pagination.limit) {
    throw new ApiError(
      'invalid-response',
      'The server returned a different ships page than requested. Please try again.',
    )
  }

  return result.data
}

export async function getShip(token: string, symbol: string, signal?: AbortSignal): Promise<Ship> {
  const response = await getJson(apiEndpoints.ships.detail(symbol), token, signal)

  const result = shipResponseSchema.safeParse(response)

  if (!result.success) {
    throw new ApiError(
      'invalid-response',
      'The ship response is incomplete or invalid. Please try again.',
    )
  }

  if (result.data.data.symbol !== symbol) {
    throw new ApiError(
      'invalid-response',
      'The server returned a different ship than requested. Please try again.',
    )
  }

  return result.data.data
}
