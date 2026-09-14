import { useQueryClient } from '@tanstack/vue-query'
import { onScopeDispose, ref, shallowRef, watch } from 'vue'
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

export function useLogin() {
  const auth = useAuthStore()
  const queryClient = useQueryClient()

  const isSubmitting = ref(false)
  const fieldError = ref('')
  const error = shallowRef<ApiError | null>(null)

  let activeController: AbortController | null = null

  function clearErrors() {
    fieldError.value = ''
    error.value = null
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
    if (isSubmitting.value) {
      return false
    }

    clearErrors()

    const parsed = tokenSchema.safeParse(rawToken)

    if (!parsed.success) {
      fieldError.value = parsed.error.issues[0]?.message ?? 'Enter a valid token.'

      return false
    }

    const controller = new AbortController()
    const startingSessionId = auth.sessionId

    activeController = controller
    isSubmitting.value = true

    try {
      const agent = await getAgent(parsed.data, controller.signal)

      if (controller.signal.aborted || auth.sessionId !== startingSessionId) {
        return false
      }

      // The request is complete before we change the session identity.
      activeController = null

      const sessionId = auth.establishSession(parsed.data)

      if (sessionId === null) {
        error.value = new ApiError(
          'request',
          'Your browser could not save the session. Allow site storage and try again.',
        )

        return false
      }

      queryClient.clear()
      queryClient.setQueryData(agentKeys.current(sessionId), agent)

      return true
    } catch (cause: unknown) {
      if (!controller.signal.aborted && auth.sessionId === startingSessionId) {
        error.value =
          cause instanceof ApiError
            ? cause
            : new ApiError('request', 'Unable to connect. Please try again.')
      }

      return false
    } finally {
      activeController = null
      isSubmitting.value = false
    }
  }

  return {
    isSubmitting,
    fieldError,
    error,
    login,
    cancelLogin,
    clearErrors,
  }
}
