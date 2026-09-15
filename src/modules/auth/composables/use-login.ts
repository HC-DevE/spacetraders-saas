import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { onScopeDispose, ref, watch } from 'vue'
import { z } from 'zod'

import { getAgent } from '@/modules/agent/api/agent.api'
import { agentKeys } from '@/modules/agent/composables/use-agent-query'
import { ApiError } from '@/shared/api/api-error'

import { useAuthStore } from '../auth.store'

const tokenSchema = z
  .string()
  .trim()
  .min(1, 'Enter your agent token.')
  .refine(
    (value) => !/\s/.test(value),
    'Paste the token only, without spaces or the Bearer prefix.',
  )

type LoginVariables = {
  token: string
  controller: AbortController
  sessionId: string
}

export function useLogin() {
  const auth = useAuthStore()
  const queryClient = useQueryClient()

  const fieldError = ref('')

  let activeController: AbortController | null = null

  const { mutateAsync, isPending, error, reset } = useMutation<boolean, ApiError, LoginVariables>({
    // A login must fail promptly when offline, not resume later in the background.
    networkMode: 'always',
    retry: false,
    gcTime: 0,

    mutationFn: async ({ token, controller, sessionId: startingSessionId }) => {
      try {
        if (controller.signal.aborted || auth.sessionId !== startingSessionId) {
          return false
        }

        const agent = await getAgent(token, controller.signal)

        if (controller.signal.aborted || auth.sessionId !== startingSessionId) {
          return false
        }

        // Do not cancel our own completed request when establishing the session.
        activeController = null

        const sessionId = auth.establishSession(token)

        if (sessionId === null) {
          throw new ApiError(
            'request',
            'Your browser could not save the session. Allow site storage and try again.',
          )
        }

        queryClient.clear()
        queryClient.setQueryData(agentKeys.current(sessionId), agent)

        return true
      } catch (cause: unknown) {
        if (controller.signal.aborted || auth.sessionId !== startingSessionId) {
          return false
        }

        throw cause instanceof ApiError
          ? cause
          : new ApiError('request', 'Unable to connect. Please try again.')
      } finally {
        if (activeController === controller) {
          activeController = null
        }
      }
    },
  })

  function clearErrors() {
    fieldError.value = ''

    if (!isPending.value) {
      reset()
    }
  }

  function cancelLogin() {
    activeController?.abort()
    activeController = null
  }

  watch(
    () => auth.sessionId,
    () => cancelLogin(),
    { flush: 'sync' },
  )

  onScopeDispose(cancelLogin)

  async function login(rawToken: string): Promise<boolean> {
    if (isPending.value) {
      return false
    }

    clearErrors()

    const parsed = tokenSchema.safeParse(rawToken)

    if (!parsed.success) {
      fieldError.value = parsed.error.issues[0]?.message ?? 'Enter a valid token.'

      return false
    }

    const controller = new AbortController()
    activeController = controller

    try {
      return await mutateAsync({ token: parsed.data, controller, sessionId: auth.sessionId })
    } catch {
      // TanStack exposes the request error to the form through `error`.
      return false
    }
  }

  return {
    isPending,
    fieldError,
    error,
    login,
    cancelLogin,
    clearErrors,
  }
}
