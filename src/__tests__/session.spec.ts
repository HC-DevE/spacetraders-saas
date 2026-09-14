import type { QueryClient } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createQueryClient } from '@/app/providers/query-client'
import { useAuthStore, type AuthStore } from '@/modules/auth/auth.store'
import { ApiError } from '@/shared/api/api-error'

const storageKey = 'space-control.agent-token'

let auth: AuthStore
let queryClient: QueryClient

beforeEach(() => {
  sessionStorage.clear()
  auth = useAuthStore(createPinia())
  queryClient = createQueryClient(auth)
})

afterEach(() => {
  queryClient.clear()
  vi.restoreAllMocks()
  sessionStorage.clear()
})

describe('Session management', () => {
  it('persists the token and renews the identity on login and logout', () => {
    const initialSessionId = auth.sessionId
    const connectedSessionId = auth.establishSession('first-token')

    expect(connectedSessionId).not.toBe(initialSessionId)
    expect(auth.token).toBe('first-token')
    expect(sessionStorage.getItem(storageKey)).toBe('first-token')

    auth.endSession()

    expect(auth.hasToken).toBe(false)
    expect(auth.token).toBeNull()
    expect(auth.sessionId).not.toBe(connectedSessionId)
    expect(auth.endReason).toBe('logout')
    expect(sessionStorage.getItem(storageKey)).toBeNull()
  })

  it('restores a saved token with a new local session identity', () => {
    auth.establishSession('saved-token')

    const restoredAuth = useAuthStore(createPinia())

    expect(restoredAuth.token).toBe('saved-token')
    expect(restoredAuth.hasToken).toBe(true)
    expect(restoredAuth.sessionId).not.toBe(auth.sessionId)
  })

  it('renews the identity even when ending an unauthenticated session', () => {
    const previousSessionId = auth.sessionId

    auth.endSession()

    expect(auth.token).toBeNull()
    expect(auth.sessionId).not.toBe(previousSessionId)
  })

  it('does not establish a session when storage refuses the token', () => {
    const previousSessionId = auth.sessionId

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError')
    })

    expect(auth.establishSession('candidate-token')).toBeNull()
    expect(auth.hasToken).toBe(false)
    expect(auth.sessionId).toBe(previousSessionId)
  })

  it('clears the local session even when storage removal fails', () => {
    auth.establishSession('saved-token')

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError')
    })

    auth.endSession()

    expect(auth.token).toBeNull()
    expect(auth.endReason).toBe('storage-error')
  })

  it('clears the session and cache when the current token is rejected', async () => {
    const sessionId = auth.establishSession('rejected-token')

    queryClient.setQueryData(['session', sessionId, 'fleet'], { ships: ['TEST-1'] })

    await expect(
      queryClient.fetchQuery({
        queryKey: ['session', sessionId, 'agent'],
        queryFn: () =>
          Promise.reject(
            new ApiError('authentication', 'Token rejected.', {
              status: 401,
            }),
          ),
      }),
    ).rejects.toMatchObject({
      kind: 'authentication',
    })

    expect(auth.hasToken).toBe(false)
    expect(auth.endReason).toBe('token-rejected')
    expect(sessionStorage.getItem(storageKey)).toBeNull()
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
  })

  it('does not end a new session because an older request fails', async () => {
    const oldSessionId = auth.establishSession('old-token')
    const currentSessionId = auth.establishSession('current-token')
    const currentAgentKey = ['session', currentSessionId, 'agent'] as const

    queryClient.setQueryData(currentAgentKey, { symbol: 'CURRENT' })

    await expect(
      queryClient.fetchQuery({
        queryKey: ['session', oldSessionId, 'agent'],
        queryFn: () =>
          Promise.reject(
            new ApiError('authentication', 'Old token rejected.', {
              status: 401,
            }),
          ),
      }),
    ).rejects.toMatchObject({
      kind: 'authentication',
    })

    expect(auth.sessionId).toBe(currentSessionId)
    expect(auth.token).toBe('current-token')
    expect(queryClient.getQueryData(currentAgentKey)).toEqual({
      symbol: 'CURRENT',
    })
  })

  it('keeps the session when an action is forbidden', async () => {
    const sessionId = auth.establishSession('valid-token')

    await expect(
      queryClient.fetchQuery({
        queryKey: ['session', sessionId, 'restricted-resource'],
        queryFn: () =>
          Promise.reject(
            new ApiError('request', 'Permission denied.', {
              status: 403,
            }),
          ),
      }),
    ).rejects.toMatchObject({
      status: 403,
    })

    expect(auth.sessionId).toBe(sessionId)
    expect(auth.hasToken).toBe(true)
  })
})
