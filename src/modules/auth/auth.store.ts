import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const TOKEN_STORAGE_KEY = 'space-control.agent-token'

type SessionEndReason = 'logout' | 'token-rejected' | 'storage-error'

function readStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY)?.trim() || null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(readStoredToken())
  const sessionId = ref(crypto.randomUUID())
  const endReason = ref<SessionEndReason | null>(null)

  const hasToken = computed(() => Boolean(token.value))

  function establishSession(validatedToken: string): string | null {
    const normalizedToken = validatedToken.trim()

    if (!normalizedToken) {
      throw new Error('Cannot establish a session without a token.')
    }

    try {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, normalizedToken)
    } catch {
      return null
    }

    sessionId.value = crypto.randomUUID()
    token.value = normalizedToken
    endReason.value = null

    return sessionId.value
  }

  function endSession(reason: SessionEndReason = 'logout') {
    token.value = null
    sessionId.value = crypto.randomUUID()
    endReason.value = reason

    try {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch {
      endReason.value = 'storage-error'
    }
  }

  return {
    token,
    sessionId,
    hasToken,
    endReason,
    establishSession,
    endSession,
  }
})

export type AuthStore = ReturnType<typeof useAuthStore>
