import { ApiError } from '@/shared/api/api-error'
import { apiEndpoints } from '@/shared/api/endpoints'
import { getJson } from '@/shared/api/http'

import { waypointResponseSchema, type Waypoint } from '../schemas/waypoint.schema'
import {
  waypointsParamsSchema,
  waypointsResponseSchema,
  type WaypointsParams,
  type WaypointsResponse,
} from '../schemas/waypoints.schema'

export async function getWaypoints(
  token: string,
  systemSymbol: string,
  params: WaypointsParams,
  signal?: AbortSignal,
): Promise<WaypointsResponse> {
  const filters = waypointsParamsSchema.parse(params)

  const search = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
  })

  for (const trait of filters.traits ?? []) {
    search.append('traits', trait)
  }

  const endpoint = apiEndpoints.systems.waypoints.list(systemSymbol)

  const response = await getJson(`${endpoint}?${search.toString()}`, token, signal)

  const result = waypointsResponseSchema.safeParse(response)

  if (!result.success) {
    throw new ApiError(
      'invalid-response',
      'The waypoints response is incomplete or invalid. Please try again.',
    )
  }

  if (result.data.meta.page !== filters.page || result.data.meta.limit !== filters.limit) {
    throw new ApiError(
      'invalid-response',
      'The server returned a different waypoints page than requested. Please try again.',
    )
  }

  if (result.data.data.some((waypoint) => waypoint.systemSymbol !== systemSymbol)) {
    throw new ApiError(
      'invalid-response',
      'The server returned waypoints from a different system. Please try again.',
    )
  }

  return result.data
}

export async function getWaypoint(
  token: string,
  systemSymbol: string,
  waypointSymbol: string,
  signal?: AbortSignal,
): Promise<Waypoint> {
  const response = await getJson(
    apiEndpoints.systems.waypoints.detail(systemSymbol, waypointSymbol),
    token,
    signal,
  )

  const result = waypointResponseSchema.safeParse(response)

  if (!result.success) {
    throw new ApiError(
      'invalid-response',
      'The waypoint response is incomplete or invalid. Please try again.',
    )
  }

  if (
    result.data.data.systemSymbol !== systemSymbol ||
    result.data.data.symbol !== waypointSymbol
  ) {
    throw new ApiError(
      'invalid-response',
      'The server returned a different waypoint than requested. Please try again.',
    )
  }

  return result.data.data
}
