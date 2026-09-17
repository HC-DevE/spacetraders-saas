import type { QueryClient } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createQueryClient } from '@/app/providers/query-client'
import { useAuthStore, type AuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/api/api-error'

const storageKey = 'space-control.agent-token'
const agentSymbolStorageKey = 'space-control.agent-symbol'

let auth: AuthStore
let queryClient: QueryClient

beforeEach(() => {
  localStorage.clear()
  auth = useAuthStore(createPinia())
  queryClient = createQueryClient(auth)
})

afterEach(() => {
  queryClient.clear()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('Token storage and authentication errors', () => {
  it('persists and removes the token', () => {
    auth.setToken('saved-token')

    expect(auth.hasToken).toBe(true)
    expect(localStorage.getItem(storageKey)).toBe('saved-token')

    auth.clearToken()

    expect(auth.token).toBeNull()
    expect(auth.hasToken).toBe(false)
    expect(localStorage.getItem(storageKey)).toBeNull()
  })

  it('restores the token when a new application instance starts', () => {
    auth.setToken('saved-token')

    const restoredAuth = useAuthStore(createPinia())

    expect(restoredAuth.token).toBe('saved-token')
    expect(restoredAuth.hasToken).toBe(true)
  })

  it('persists the current agent identity', () => {
    auth.setToken('saved-token')
    auth.setAgentSymbol('VOYAGER_7')

    expect(auth.agentSymbol).toBe('VOYAGER_7')

    expect(localStorage.getItem(agentSymbolStorageKey)).toBe('VOYAGER_7')
  })

  it('restores the agent identity with the saved token', () => {
    auth.setToken('saved-token')
    auth.setAgentSymbol('VOYAGER_7')

    const restoredAuth = useAuthStore(createPinia())

    expect(restoredAuth.token).toBe('saved-token')

    expect(restoredAuth.agentSymbol).toBe('VOYAGER_7')
  })

  it('starts without a token when reading storage fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError')
    })

    expect(useAuthStore(createPinia()).hasToken).toBe(false)
  })

  it('does not authenticate when the token cannot be saved', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError')
    })

    expect(() => auth.setToken('candidate-token')).toThrow('could not save the token')
    expect(auth.hasToken).toBe(false)
  })

  it('clears the in-memory token even if storage removal fails', () => {
    auth.setToken('saved-token')

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError')
    })

    expect(() => auth.clearToken()).toThrow('Storage blocked')
    expect(auth.hasToken).toBe(false)
  })

  it('clears the token and all queries after an authentication error', async () => {
    auth.setToken('rejected-token')

    queryClient.setQueryData(['ships', 'detail', 'TEST-1'], { symbol: 'TEST-1' })

    await expect(
      queryClient.fetchQuery({
        queryKey: ['agent', 'current'],
        queryFn: () => Promise.reject(new ApiError('authentication', 'Token rejected.')),
      }),
    ).rejects.toMatchObject({ kind: 'authentication' })

    expect(auth.hasToken).toBe(false)
    expect(localStorage.getItem(storageKey)).toBeNull()
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
  })

  it.each([
    new ApiError('request', 'Permission denied.', { status: 403 }),
    new ApiError('rate-limit', 'Too many requests.', { status: 429 }),
    new ApiError('network', 'Connection unavailable.'),
  ])('keeps the token after $kind errors', async (error) => {
    auth.setToken('valid-token')

    await expect(
      queryClient.fetchQuery({
        queryKey: ['agent', 'current'],
        queryFn: () => Promise.reject(error),
        retry: false,
      }),
    ).rejects.toBe(error)

    expect(auth.token).toBe('valid-token')
    expect(localStorage.getItem(storageKey)).toBe('valid-token')
  })

  it('removes the agent identity when the token is cleared', () => {
    auth.setToken('saved-token')
    auth.setAgentSymbol('VOYAGER_7')

    auth.clearToken()

    expect(auth.token).toBeNull()
    expect(auth.agentSymbol).toBeNull()

    expect(localStorage.getItem(storageKey)).toBeNull()

    expect(localStorage.getItem(agentSymbolStorageKey)).toBeNull()
  })

  it('does not restore an agent identity without a token', () => {
    localStorage.setItem(agentSymbolStorageKey, 'OLD-AGENT')

    const restoredAuth = useAuthStore(createPinia())

    expect(restoredAuth.token).toBeNull()
    expect(restoredAuth.agentSymbol).toBeNull()
    expect(restoredAuth.hasToken).toBe(false)
  })
})
