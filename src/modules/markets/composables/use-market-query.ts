import { queryOptions, useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { useAuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/api/api-error'

import { getMarket } from '../api/markets.api'
import { marketKeys } from './market.keys'

export function useMarketQuery(
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
        queryKey: marketKeys.detail(system, waypoint),

        enabled: Boolean(token && system && waypoint),

        queryFn: ({ signal }) => {
          if (!token) {
            throw new ApiError('authentication', 'An agent token is required.')
          }

          return getMarket(token, system, waypoint, signal)
        },
      })
    }),
  )
}
