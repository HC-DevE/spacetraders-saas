import { ApiError } from '@/shared/api/api-error'
import { apiEndpoints } from '@/shared/api/endpoints'
import { getJson } from '@/shared/api/http'

import {
  systemsParamsSchema,
  systemsResponseSchema,
  type SystemsParams,
  type SystemsResponse,
} from '../schemas/systems.schema'
import { systemResponseSchema, type System } from '../schemas/system.schema'

export async function getSystems(
  token: string,
  params: SystemsParams,
  signal?: AbortSignal,
): Promise<SystemsResponse> {
  const pagination = systemsParamsSchema.parse(params)

  const search = new URLSearchParams({
    page: String(pagination.page),
    limit: String(pagination.limit),
  })

  const response = await getJson(`${apiEndpoints.systems.list}?${search.toString()}`, token, signal)

  const result = systemsResponseSchema.safeParse(response)

  if (!result.success) {
    throw new ApiError(
      'invalid-response',
      'The systems response is incomplete or invalid. Please try again.',
    )
  }

  if (result.data.meta.page !== pagination.page || result.data.meta.limit !== pagination.limit) {
    throw new ApiError(
      'invalid-response',
      'The server returned a different systems page than requested. Please try again.',
    )
  }

  return result.data
}

export async function getSystem(
  token: string,
  symbol: string,
  signal?: AbortSignal,
): Promise<System> {
  const response = await getJson(apiEndpoints.systems.detail(symbol), token, signal)

  const result = systemResponseSchema.safeParse(response)

  if (!result.success) {
    throw new ApiError(
      'invalid-response',
      'The system response is incomplete or invalid. Please try again.',
    )
  }

  if (result.data.data.symbol !== symbol) {
    throw new ApiError(
      'invalid-response',
      'The server returned a different system than requested. Please try again.',
    )
  }

  return result.data.data
}
