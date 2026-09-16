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
import { useAuthStore } from '@/modules/auth/auth.store'

const endpoint = 'https://api.spacetraders.io/v2/my/agent'
const server = setupServer()

let cleanup: (() => void) | undefined

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  localStorage.clear()

  server.use(
    http.get(endpoint, () =>
      HttpResponse.json({
        data: {
          symbol: 'TEST',
          headquarters: 'X1-HZ83-A1',
          credits: 175000,
          startingFaction: 'AEGIS',
          shipCount: 2,
        },
      }),
    ),
  )
})

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  server.resetHandlers()
  localStorage.clear()
})

afterAll(() => {
  server.close()
})

async function mountOverview() {
  const pinia = createPinia()
  const auth = useAuthStore(pinia)
  auth.setToken('agent-overview-token')

  const queryClient = createQueryClient(auth)
  const router = createAppRouter(auth, createMemoryHistory())

  await router.push('/')
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

  return wrapper
}

describe('Agent overview', () => {
  it('links owned ships and headquarters to their application sections', async () => {
    const wrapper = await mountOverview()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('X1-HZ83-A1')
    })

    expect(wrapper.get('a[aria-label="Open fleet"]').attributes('href')).toBe('/fleet')
    expect(wrapper.get('a[aria-label="Open headquarters X1-HZ83-A1"]').attributes('href')).toBe(
      '/systems/X1-HZ83/waypoints/X1-HZ83-A1',
    )
  })
})
