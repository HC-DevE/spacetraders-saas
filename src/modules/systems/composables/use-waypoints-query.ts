import { queryOptions, useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { useAuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/api/api-error'

import { getWaypoints } from '../api/waypoints.api'
import type { WaypointsParams } from '../schemas/waypoints.schema'
import { waypointKeys } from './waypoint.keys'

export function useWaypointsQuery(
  systemSymbol: MaybeRefOrGetter<string>,
  params: MaybeRefOrGetter<WaypointsParams>,
) {
  const auth = useAuthStore()

  return useQuery(
    computed(() => {
      const token = auth.token
      const symbol = toValue(systemSymbol)
      const sourceParams = toValue(params)

      const filters: WaypointsParams = {
        ...sourceParams,
        traits: sourceParams.traits ? [...sourceParams.traits] : undefined,
      }

      return queryOptions({
        queryKey: waypointKeys.list(symbol, filters),
        enabled: Boolean(token && symbol),

        queryFn: ({ signal }) => {
          if (!token) {
            throw new ApiError('authentication', 'An agent token is required.')
          }

          return getWaypoints(token, symbol, filters, signal)
        },

        placeholderData: (previousData, previousQuery) => {
          const previousParams = previousQuery?.queryKey[3] as WaypointsParams | undefined

          if (!previousParams) {
            return undefined
          }

          const previousTraits = previousParams.traits ?? []
          const currentTraits = filters.traits ?? []

          const sameTraits =
            previousTraits.length === currentTraits.length &&
            previousTraits.every((trait, index) => trait === currentTraits[index])

          const samePageSize = previousParams.limit === filters.limit

          return samePageSize && sameTraits ? previousData : undefined
        },
      })
    }),
  )
}
