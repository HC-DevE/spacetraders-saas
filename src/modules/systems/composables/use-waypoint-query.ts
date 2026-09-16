import { queryOptions, useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { useAuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/api/api-error'

import { getWaypoint } from '../api/waypoints.api'
import { waypointKeys } from './waypoint.keys'

export function useWaypointQuery(
  systemSymbol: MaybeRefOrGetter<string>,
  waypointSymbol: MaybeRefOrGetter<string>,
) {
  const auth = useAuthStore()

  return useQuery(
    computed(() => {
      const token = auth.token
      const system = toValue(systemSymbol)
      const waypoint = toValue(waypointSymbol)

      return queryOptions({
        queryKey: waypointKeys.detail(system, waypoint),

        enabled: Boolean(token && system && waypoint),

        queryFn: ({ signal }) => {
          if (!token) {
            throw new ApiError('authentication', 'An agent token is required.')
          }

          return getWaypoint(token, system, waypoint, signal)
        },
      })
    }),
  )
}
