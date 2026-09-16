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

import { createSystem } from './system.fixture'
import { routeNames } from '@/app/router/route-names'

const endpoint = 'https://api.spacetraders.io/v2/systems'
const server = setupServer()

let systems = Array.from({ length: 11 }, (_, index) =>
  createSystem(`X1-TEST-${String(index + 1).padStart(2, '0')}`, index === 1 ? 'nebula' : 'star'),
)

let requests: Array<{
  page: number
  limit: number
  authorization: string | null
}> = []

let cleanup: (() => void) | undefined

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  localStorage.clear()
  requests = []

  systems = Array.from({ length: 11 }, (_, index) =>
    createSystem(`X1-TEST-${String(index + 1).padStart(2, '0')}`, index === 1 ? 'nebula' : 'star'),
  )

  server.use(
    http.get(endpoint, ({ request }) => {
      const url = new URL(request.url)
      const page = Number(url.searchParams.get('page'))
      const limit = Number(url.searchParams.get('limit'))

      requests.push({
        page,
        limit,
        authorization: request.headers.get('authorization'),
      })

      const start = (page - 1) * limit

      return HttpResponse.json({
        data: systems.slice(start, start + limit),
        meta: {
          page,
          limit,
          total: systems.length,
        },
      })
    }),
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

async function mountSystems(path = '/systems') {
  const pinia = createPinia()
  const auth = useAuthStore(pinia)

  auth.setToken('systems-test-token')

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

  return {
    wrapper,
    router,
    auth,
    queryClient,
  }
}

describe('Systems page', () => {
  it('loads systems with the token and falls back from invalid URL parameters', async () => {
    const { wrapper } = await mountSystems('/systems?page=abc&limit=999')

    await vi.waitFor(() => {
      expect(wrapper.findAll('article')).toHaveLength(10)
    })

    expect(requests).toEqual([
      {
        page: 1,
        limit: 10,
        authorization: 'Bearer systems-test-token',
      },
    ])

    expect(wrapper.text()).toContain('X1-TEST-01')
    expect(wrapper.text()).toContain('X1-TEST-10')
    expect(wrapper.text()).not.toContain('X1-TEST-11')

    expect(wrapper.text()).toContain('Coordinates')
    expect(wrapper.text()).toContain('Waypoints')

    const systemsLink = wrapper.get('nav[aria-label="Main navigation"] a[href="/systems"]')

    expect(systemsLink.text()).toBe('Systems')
    expect(systemsLink.attributes('aria-current')).toBe('page')
  })

  it('loads the next page and resets the page when the limit changes', async () => {
    const { wrapper, router } = await mountSystems('/systems?limit=10')

    await vi.waitFor(() => {
      expect(wrapper.findAll('article')).toHaveLength(10)
    })

    await wrapper.get('button[aria-label="Next systems page"]').trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.query.page).toBe('2')
      expect(wrapper.text()).toContain('X1-TEST-11')
    })

    expect(wrapper.findAll('article')).toHaveLength(1)
    expect(wrapper.text()).not.toContain('X1-TEST-01')

    await wrapper.get('#systems-limit').setValue('20')

    await vi.waitFor(() => {
      expect(wrapper.findAll('article')).toHaveLength(11)
    })

    expect(router.currentRoute.value.query.page).toBe('1')
    expect(router.currentRoute.value.query.limit).toBe('20')

    expect(requests.map(({ page, limit }) => ({ page, limit }))).toEqual([
      { page: 1, limit: 10 },
      { page: 2, limit: 10 },
      { page: 1, limit: 20 },
    ])
  })

  it('displays an empty systems list', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: [],
          meta: {
            page: 1,
            limit: 10,
            total: 0,
          },
        }),
      ),
    )

    const { wrapper } = await mountSystems()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('No systems available')
    })

    expect(wrapper.findAll('article')).toHaveLength(0)

    expect(wrapper.find('nav[aria-label="Systems pagination"]').exists()).toBe(false)
  })

  it('allows returning from an out-of-range page', async () => {
    const { wrapper, router } = await mountSystems('/systems?page=99')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('No systems on this page')
    })

    expect(wrapper.findAll('article')).toHaveLength(0)

    await wrapper.get('button[aria-label="Return to first systems page"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.findAll('article')).toHaveLength(10)
      expect(wrapper.text()).toContain('X1-TEST-01')
    })

    expect(router.currentRoute.value.query.page).toBe('1')
  })

  it('reports an invalid nested system response instead of showing an empty list', async () => {
    const system = createSystem('X1-BROKEN')

    const invalidSystem = {
      ...system,

      waypoints: [
        {
          symbol: 'X1-BROKEN-A1',
          type: 'PLANET',
          x: 12,
          y: -4,

          // orbitals is deliberately missing.
        },
      ],
    }

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: [invalidSystem],
          meta: {
            page: 1,
            limit: 10,
            total: 1,
          },
        }),
      ),
    )

    const { wrapper } = await mountSystems()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load systems')
    })

    expect(wrapper.text()).not.toContain('No systems available')
    expect(wrapper.findAll('article')).toHaveLength(0)
  })

  it('rejects a response whose pagination does not match the requested page', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: [createSystem('X1-WRONG-PAGE')],
          meta: {
            page: 2,
            limit: 10,
            total: 1,
          },
        }),
      ),
    )

    const { wrapper } = await mountSystems('/systems?page=1&limit=10')

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load systems')
    })

    expect(wrapper.text()).not.toContain('X1-WRONG-PAGE')
  })

  it('keeps existing systems visible when refresh fails', async () => {
    const { wrapper } = await mountSystems()

    await vi.waitFor(() => {
      expect(wrapper.findAll('article')).toHaveLength(10)
    })

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          {
            error: {
              code: 4999,
              message: 'Simulated request failure',
            },
          },
          {
            status: 400,
          },
        ),
      ),
    )

    await wrapper.get('button[aria-label="Refresh systems"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Could not refresh systems')
    })

    expect(wrapper.findAll('article')).toHaveLength(10)
    expect(wrapper.text()).toContain('X1-TEST-01')
    expect(wrapper.text()).toContain('X1-TEST-10')
  })

  it('does not display systems from the previous agent after reconnecting', async () => {
    const { wrapper, router, queryClient } = await mountSystems()

    await vi.waitFor(() => {
      expect(wrapper.findAll('article')).toHaveLength(10)
    })

    expect(wrapper.text()).toContain('X1-TEST-01')

    let releaseResponse: (() => void) | undefined
    let authorization: string | null = null

    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve
    })

    server.use(
      http.get(endpoint, async ({ request }) => {
        authorization = request.headers.get('authorization')

        await responseGate

        return HttpResponse.json({
          data: [createSystem('X1-OTHER')],
          meta: {
            page: 1,
            limit: 10,
            total: 1,
          },
        })
      }),
    )

    server.use(
      http.get('https://api.spacetraders.io/v2/my/agent', () =>
        HttpResponse.json({
          data: {
            symbol: 'OTHER',
            headquarters: 'X1-HZ83-A1',
            credits: 175000,
            startingFaction: 'AEGIS',
            shipCount: 1,
          },
        }),
      ),
    )

    try {
      await wrapper.get('[data-testid="logout"]').trigger('click')

      await vi.waitFor(() => {
        expect(router.currentRoute.value.name).toBe(routeNames.login)
        expect(wrapper.find('#agent-token').exists()).toBe(true)
      })

      expect(queryClient.getQueryCache().getAll()).toHaveLength(0)

      await wrapper.get('#agent-token').setValue('other-agent-token')
      await wrapper.get('form').trigger('submit')

      await vi.waitFor(() => {
        expect(router.currentRoute.value.name).toBe('agent-overview')
      })

      await router.push('/systems')

      await vi.waitFor(() => {
        expect(authorization).toBe('Bearer other-agent-token')
      })

      expect(wrapper.findAll('article')).toHaveLength(0)
      expect(wrapper.text()).not.toContain('X1-TEST-01')

      releaseResponse?.()

      await vi.waitFor(() => {
        expect(wrapper.text()).toContain('X1-OTHER')
      })

      expect(wrapper.findAll('article')).toHaveLength(1)
      expect(wrapper.text()).not.toContain('X1-TEST-01')
      expect(wrapper.text()).not.toContain('X1-TEST-10')
    } finally {
      releaseResponse?.()
    }
  })
  it('opens the selected system details', async () => {
    let requestedSymbol: string | undefined
    let authorization: string | null = null

    server.use(
      http.get('https://api.spacetraders.io/v2/systems/:systemSymbol', ({ params, request }) => {
        requestedSymbol = String(params.systemSymbol)

        authorization = request.headers.get('authorization')

        return HttpResponse.json({
          data: createSystem(requestedSymbol),
        })
      }),

      http.get('https://api.spacetraders.io/v2/systems/:systemSymbol/waypoints', () =>
        HttpResponse.json({
          data: [],
          meta: {
            page: 1,
            limit: 10,
            total: 0,
          },
        }),
      ),
    )

    const { wrapper, router } = await mountSystems()

    await vi.waitFor(() => {
      expect(wrapper.find('button[aria-label="View system X1-TEST-01"]').exists()).toBe(true)
    })

    const detailsButton = wrapper.get<HTMLButtonElement>(
      'button[aria-label="View system X1-TEST-01"]',
    )

    expect(detailsButton.attributes('type')).toBe('button')

    await detailsButton.trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('system-detail')

      expect(router.currentRoute.value.params.systemSymbol).toBe('X1-TEST-01')

      expect(wrapper.text()).toContain('System overview')
    })

    expect(requestedSymbol).toBe('X1-TEST-01')

    expect(authorization).toBe('Bearer systems-test-token')
  })
})
