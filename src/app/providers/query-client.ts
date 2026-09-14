import { QueryCache, QueryClient } from '@tanstack/vue-query'

import type { AuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/api/api-error'

export function createQueryClient(auth: AuthStore): QueryClient {
  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (!(error instanceof ApiError) || error.kind !== 'authentication') {
          return
        }

        const [scope, requestSessionId] = query.queryKey

        if (!auth.hasToken || scope !== 'session' || requestSessionId !== auth.sessionId) {
          return
        }

        auth.endSession('token-rejected')
        queryClient.clear()
      },
    }),

    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,

        retry: (failureCount, error) => {
          if (!(error instanceof ApiError)) {
            return false
          }

          const isTemporaryFailure =
            error.kind === 'network' || error.kind === 'timeout' || error.kind === 'server'

          return isTemporaryFailure && failureCount < 1
        },

        retryDelay: 1_000,
      },

      mutations: {
        retry: false,
      },
    },
  })

  return queryClient
}
