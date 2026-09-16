import { queryOptions, useQuery } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { useAuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/api/api-error'

import { getSystems } from '../api/systems.api'
import type { SystemsParams } from '../schemas/systems.schema'
import { systemKeys } from './system.keys'

export function useSystemsQuery(params: MaybeRefOrGetter<SystemsParams>) {
  const auth = useAuthStore()

  return useQuery(
    computed(() => {
      const token = auth.token
      const pagination = { ...toValue(params) }

      return queryOptions({
        queryKey: systemKeys.list(pagination),
        enabled: Boolean(token),

        queryFn: ({ signal }) => {
          if (!token) {
            throw new ApiError('authentication', 'An agent token is required.')
          }

          return getSystems(token, pagination, signal)
        },

        placeholderData: (previousData) => {
          const samePageSize = previousData?.meta.limit === pagination.limit

          return samePageSize ? previousData : undefined
        },
      })
    }),
  )
}
