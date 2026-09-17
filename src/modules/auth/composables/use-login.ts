import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { getAgent } from '@/modules/agent/api/agent.api'
import { agentKeys } from '@/modules/agent/composables/use-agent-query'

import { useAuthStore } from '../auth.store'

export function useLogin() {
  const auth = useAuthStore()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (token: string) => getAgent(token),
    networkMode: 'always',
    retry: false,
    gcTime: 0,

    onSuccess: (agent, token) => {
      auth.setToken(token)
      auth.setAgentSymbol(agent.symbol)
      queryClient.removeQueries()
      queryClient.setQueryData(agentKeys.current(), agent)
    },
  })

  return {
    login: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  }
}
