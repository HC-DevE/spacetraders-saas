import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const TOKEN_STORAGE_KEY = 'space-control.agent-token'
const AGENT_SYMBOL_STORAGE_KEY = 'space-control.agent-symbol'

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)?.trim() || null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(readStorage(TOKEN_STORAGE_KEY))

  const agentSymbol = ref<string | null>(token.value ? readStorage(AGENT_SYMBOL_STORAGE_KEY) : null)

  const hasToken = computed(() => Boolean(token.value))

  function setToken(value: string) {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, value)
    } catch {
      throw new Error('Your browser could not save the token. Allow site storage and try again.')
    }

    token.value = value
  }

  function setAgentSymbol(value: string) {
    agentSymbol.value = value

    try {
      localStorage.setItem(AGENT_SYMBOL_STORAGE_KEY, value)
    } catch {
      // Agent identity is display metadata.
      // A storage failure must not invalidate
      // an otherwise valid authenticated session.
    }
  }

  function clearToken() {
    let storageError: unknown

    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch (error) {
      storageError = error
    }

    try {
      localStorage.removeItem(AGENT_SYMBOL_STORAGE_KEY)
    } catch (error) {
      storageError ??= error
    }

    token.value = null
    agentSymbol.value = null

    if (storageError) {
      throw storageError
    }
  }

  return {
    token,
    agentSymbol,
    hasToken,
    setToken,
    setAgentSymbol,
    clearToken,
  }
})

export type AuthStore = ReturnType<typeof useAuthStore>
