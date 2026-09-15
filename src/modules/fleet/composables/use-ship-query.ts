import { queryOptions, useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { useAuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/api/api-error'

import { getShip } from '../api/ships.api'
import { shipKeys } from './ship.keys'

export function useShipQuery(symbol: MaybeRefOrGetter<string>) {
  const auth = useAuthStore()

  return useQuery(
    computed(() => {
      const token = auth.token
      const shipSymbol = toValue(symbol)

      return queryOptions({
        queryKey: shipKeys.detail(shipSymbol),
        enabled: Boolean(token && shipSymbol),

        queryFn: ({ signal }) => {
          if (!token) {
            throw new ApiError('authentication', 'An agent token is required.')
          }

          return getShip(token, shipSymbol, signal)
        },
      })
    }),
  )
}
