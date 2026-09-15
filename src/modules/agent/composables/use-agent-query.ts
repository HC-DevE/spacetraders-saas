import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

import { useAuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/api/api-error'

import { getAgent } from '../api/agent.api'

export const agentKeys = {
  current: () => ['agent', 'current'] as const,
}

export function useAgentQuery() {
  const auth = useAuthStore()

  return useQuery(
    computed(() => {
      const token = auth.token

      return {
        queryKey: agentKeys.current(),
        enabled: Boolean(token),

        queryFn: ({ signal }: { signal: AbortSignal }) => {
          if (!token) {
            throw new ApiError('authentication', 'An agent token is required.')
          }

          return getAgent(token, signal)
        },
      }
    }),
  )
}
