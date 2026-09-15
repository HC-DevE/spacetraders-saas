import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const TOKEN_STORAGE_KEY = 'space-control.agent-token'

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)?.trim() || null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(readToken())
  const hasToken = computed(() => Boolean(token.value))

  function setToken(value: string) {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, value)
    } catch {
      throw new Error('Your browser could not save the token. Allow site storage and try again.')
    }

    token.value = value
  }

  function clearToken() {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    } finally {
      token.value = null
    }
  }

  return { token, hasToken, setToken, clearToken }
})

export type AuthStore = ReturnType<typeof useAuthStore>
