import { queryOptions, useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { useAuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/api/api-error'

import { getSystem } from '../api/systems.api'
import { systemKeys } from './system.keys'

export function useSystemQuery(symbol: MaybeRefOrGetter<string>) {
  const auth = useAuthStore()

  return useQuery(
    computed(() => {
      const token = auth.token
      const systemSymbol = toValue(symbol)

      return queryOptions({
        queryKey: systemKeys.detail(systemSymbol),
        enabled: Boolean(token && systemSymbol),

        queryFn: ({ signal }) => {
          if (!token) {
            throw new ApiError('authentication', 'An agent token is required.')
          }

          return getSystem(token, systemSymbol, signal)
        },
      })
    }),
  )
}
