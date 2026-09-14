import { VueQueryPlugin } from '@tanstack/vue-query'
import { flushPromises, mount } from '@vue/test-utils'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { createPinia } from 'pinia'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'

import App from '@/App.vue'
import { createQueryClient } from '@/app/providers/query-client'
import { createAppRouter } from '@/app/router'
import { agentKeys } from '@/modules/agent/composables/use-agent-query'

import { useAuthStore } from '../auth.store'

const endpoint = 'https://api.spacetraders.io/v2/my/agent'
const storageKey = 'space-control.agent-token'

const agent = {
  symbol: 'TEST',
  headquarters: 'X1-HZ83-A1',
  credits: 175000,
  startingFaction: 'AEGIS',
  shipCount: 2,
}

const server = setupServer()

let requestCount = 0
let cleanup: (() => void) | undefined

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  sessionStorage.clear()
  requestCount = 0

  server.use(
    http.get(endpoint, () => {
      requestCount += 1
      return HttpResponse.json({ data: agent })
    }),
  )
})

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  server.resetHandlers()
  sessionStorage.clear()
})

afterAll(() => {
  server.close()
})

function rejectToken() {
  server.use(
    http.get(endpoint, () =>
      HttpResponse.json(
        {
          error: {
            code: 4000,
            message: 'Token rejected',
          },
        },
        { status: 401 },
      ),
    ),
  )
}

async function mountApplication(path = '/login') {
  const pinia = createPinia()
  const auth = useAuthStore(pinia)
  const queryClient = createQueryClient(auth)
  const router = createAppRouter(auth, createMemoryHistory())

  await router.push(path)
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [pinia, [VueQueryPlugin, { queryClient }], router],
    },
  })

  cleanup = () => {
    wrapper.unmount()
    queryClient.clear()
  }

  await flushPromises()

  return { wrapper, auth, queryClient, router }
}

describe('Authentication flow', () => {
  it('protects the overview and rejects an empty token locally', async () => {
    const { wrapper, router } = await mountApplication('/')

    expect(router.currentRoute.value.name).toBe('login')

    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('#token-field-error').text()).toBe('Enter your agent token.')
    expect(requestCount).toBe(0)
  })

  it('connects with one request and removes the saved token on logout', async () => {
    const { wrapper, auth, queryClient, router } = await mountApplication()

    await wrapper.get('#agent-token').setValue('test-agent-token')
    await wrapper.get('form').trigger('submit')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('agent-overview')
    })

    await flushPromises()

    expect(wrapper.text()).toContain('TEST')
    expect(requestCount).toBe(1)
    expect(sessionStorage.getItem(storageKey)).toBe('test-agent-token')
    expect(queryClient.getQueryData(agentKeys.current(auth.sessionId))).toEqual(agent)

    await wrapper.get('[data-testid="logout"]').trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('login')
    })

    expect(auth.token).toBeNull()
    expect(sessionStorage.getItem(storageKey)).toBeNull()
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
  })

  it('keeps the user on login when the candidate token is rejected', async () => {
    rejectToken()

    const { wrapper, auth, router } = await mountApplication()

    await wrapper.get('#agent-token').setValue('invalid-token')
    await wrapper.get('form').trigger('submit')

    await vi.waitFor(() => {
      expect(wrapper.find('#login-error').exists()).toBe(true)
    })

    expect(auth.hasToken).toBe(false)
    expect(sessionStorage.getItem(storageKey)).toBeNull()
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('restores a token and fetches fresh agent information', async () => {
    sessionStorage.setItem(storageKey, 'saved-token')

    const { wrapper, auth, router } = await mountApplication('/')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('TEST')
    })

    expect(auth.token).toBe('saved-token')
    expect(router.currentRoute.value.name).toBe('agent-overview')
    expect(requestCount).toBe(1)
  })

  it('removes a restored token if the API rejects it', async () => {
    sessionStorage.setItem(storageKey, 'expired-token')
    rejectToken()

    const { auth, queryClient, router } = await mountApplication('/')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('login')
    })

    expect(auth.hasToken).toBe(false)
    expect(auth.endReason).toBe('token-rejected')
    expect(sessionStorage.getItem(storageKey)).toBeNull()
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
  })

  it('returns to login when a connected token is later rejected', async () => {
    const { wrapper, auth, queryClient, router } = await mountApplication()

    await wrapper.get('#agent-token').setValue('test-agent-token')
    await wrapper.get('form').trigger('submit')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('agent-overview')
    })

    await flushPromises()
    rejectToken()

    await queryClient.invalidateQueries({
      queryKey: agentKeys.current(auth.sessionId),
    })

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('login')
    })

    expect(auth.hasToken).toBe(false)
    expect(sessionStorage.getItem(storageKey)).toBeNull()
  })

  it('prevents duplicate submissions and ignores a cancelled login', async () => {
    let releaseResponse: (() => void) | undefined

    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve
    })

    server.use(
      http.get(endpoint, async () => {
        requestCount += 1
        await responseGate

        return HttpResponse.json({ data: agent })
      }),
    )

    const { wrapper, auth, queryClient, router } = await mountApplication()

    const submitButton = wrapper.get<HTMLButtonElement>('button[type="submit"]')

    try {
      await wrapper.get('#agent-token').setValue('test-agent-token')
      await wrapper.get('form').trigger('submit')
      await wrapper.get('form').trigger('submit')

      await vi.waitFor(() => {
        expect(requestCount).toBe(1)
      })

      expect(submitButton.element.disabled).toBe(true)

      auth.endSession()
      queryClient.clear()
      releaseResponse?.()

      await vi.waitFor(() => {
        expect(submitButton.element.disabled).toBe(false)
      })

      await flushPromises()

      expect(auth.hasToken).toBe(false)
      expect(sessionStorage.getItem(storageKey)).toBeNull()
      expect(router.currentRoute.value.name).toBe('login')
      expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    } finally {
      releaseResponse?.()
    }
  })
})
