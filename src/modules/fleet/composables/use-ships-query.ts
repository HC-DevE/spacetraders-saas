import { queryOptions, useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { useAuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/api/api-error'

import { getShips } from '../api/ships.api'
import type { ShipsParams } from '../schemas/ships.schema'
import { shipKeys } from './ship.keys'

export function useShipsQuery(params: MaybeRefOrGetter<ShipsParams>) {
  const auth = useAuthStore()

  return useQuery(
    computed(() => {
      const token = auth.token
      const pagination = { ...toValue(params) }

      return queryOptions({
        queryKey: shipKeys.list(pagination),
        enabled: Boolean(token),

        queryFn: ({ signal }) => {
          if (!token) {
            throw new ApiError('authentication', 'An agent token is required.')
          }

          return getShips(token, pagination, signal)
        },

        placeholderData: (previousData) => {
          const samePageSize = previousData?.meta.limit === pagination.limit

          return samePageSize ? previousData : undefined
        },
      })
    }),
  )
}
