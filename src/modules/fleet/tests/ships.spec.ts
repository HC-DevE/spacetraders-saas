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

import { createShip } from './ship.fixture'

const endpoint = 'https://api.spacetraders.io/v2/my/ships'

const fleetRowsSelector = 'table[aria-label="Fleet"] tbody tr'

const fleetCardsSelector = 'ul[aria-label="Fleet cards"] > li'

const server = setupServer()

let requests: Array<{
  page: number
  limit: number
  authorization: string | null
}> = []

let cleanup: (() => void) | undefined

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  })
})

beforeEach(() => {
  localStorage.clear()

  requests = []

  const ships = [createShip('TEST-1'), createShip('TEST-2', 'probe')]

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
        data: ships.slice(start, start + limit),

        meta: {
          page,
          limit,
          total: ships.length,
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

async function mountFleet(path = '/fleet') {
  const pinia = createPinia()

  const auth = useAuthStore(pinia)

  auth.setToken('fleet-test-token')

  const queryClient = createQueryClient(auth)

  const router = createAppRouter(auth, createMemoryHistory())

  await router.push(path)
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [
        pinia,
        [
          VueQueryPlugin,
          {
            queryClient,
          },
        ],
        router,
      ],
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

describe('Fleet page', () => {
  it('loads ships with the token and falls back from invalid URL parameters', async () => {
    const { wrapper } = await mountFleet('/fleet?page=abc&limit=999')

    await vi.waitFor(() => {
      expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(2)
    })

    expect(requests).toEqual([
      {
        page: 1,
        limit: 10,
        authorization: 'Bearer fleet-test-token',
      },
    ])

    expect(wrapper.text()).toContain('TEST-1')

    expect(wrapper.text()).toContain('TEST-2')

    expect(wrapper.text()).toContain('No fuel capacity')

    expect(wrapper.text()).toContain('No cargo capacity')

    expect(wrapper.find('a[aria-label="Open ship TEST-1"]').exists()).toBe(true)

    expect(wrapper.find('a[aria-label="Open ship TEST-2"]').exists()).toBe(true)

    expect(wrapper.get('a[aria-label="Open system X1-MQ65"]').attributes('href')).toBe(
      '/systems/X1-MQ65',
    )

    expect(wrapper.get('a[aria-label="Open waypoint X1-MQ65-A1"]').attributes('href')).toBe(
      '/systems/X1-MQ65/waypoints/X1-MQ65-A1',
    )
  })

  it('renders the cards view from the URL', async () => {
    const { wrapper } = await mountFleet('/fleet?view=cards')

    await vi.waitFor(() => {
      expect(wrapper.findAll(fleetCardsSelector)).toHaveLength(2)
    })

    expect(wrapper.find('table[aria-label="Fleet"]').exists()).toBe(false)

    expect(wrapper.get('button[aria-label="Show cards view"]').attributes('aria-pressed')).toBe(
      'true',
    )

    expect(wrapper.get('button[aria-label="Show table view"]').attributes('aria-pressed')).toBe(
      'false',
    )

    expect(wrapper.find('a[aria-label="Open ship TEST-1"]').exists()).toBe(true)

    expect(wrapper.find('a[aria-label="Open ship TEST-2"]').exists()).toBe(true)

    expect(wrapper.get('a[aria-label="Open system X1-MQ65"]').attributes('href')).toBe(
      '/systems/X1-MQ65',
    )

    expect(wrapper.get('a[aria-label="Open waypoint X1-MQ65-A1"]').attributes('href')).toBe(
      '/systems/X1-MQ65/waypoints/X1-MQ65-A1',
    )

    expect(wrapper.text()).toContain('No fuel capacity')

    expect(wrapper.text()).toContain('No cargo capacity')
  })

  it('switches view mode without refetching ships and preserves pagination', async () => {
    const { wrapper, router } = await mountFleet('/fleet?page=1&limit=10')

    await vi.waitFor(() => {
      expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(2)
    })

    expect(requests).toHaveLength(1)

    await wrapper.get('button[aria-label="Show cards view"]').trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.query.view).toBe('cards')

      expect(wrapper.findAll(fleetCardsSelector)).toHaveLength(2)
    })

    expect(router.currentRoute.value.query.page).toBe('1')

    expect(router.currentRoute.value.query.limit).toBe('10')

    expect(wrapper.find('table[aria-label="Fleet"]').exists()).toBe(false)

    expect(requests).toHaveLength(1)

    await wrapper.get('button[aria-label="Show table view"]').trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.query.view).toBeUndefined()

      expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(2)
    })

    expect(router.currentRoute.value.query.page).toBe('1')

    expect(router.currentRoute.value.query.limit).toBe('10')

    expect(wrapper.find('ul[aria-label="Fleet cards"]').exists()).toBe(false)

    expect(requests).toHaveLength(1)
  })

  it('falls back to the table view for an invalid view parameter', async () => {
    const { wrapper } = await mountFleet('/fleet?view=invalid')

    await vi.waitFor(() => {
      expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(2)
    })

    expect(wrapper.find('ul[aria-label="Fleet cards"]').exists()).toBe(false)

    expect(wrapper.get('button[aria-label="Show table view"]').attributes('aria-pressed')).toBe(
      'true',
    )

    expect(wrapper.get('button[aria-label="Show cards view"]').attributes('aria-pressed')).toBe(
      'false',
    )
  })

  it('shows the destination and expected arrival in cards view while a ship is in transit', async () => {
    const transitShip = createShip('TEST-TRANSIT')

    transitShip.nav.status = 'IN_TRANSIT'

    transitShip.nav.route.destination = {
      symbol: 'X1-MQ65-B2',
      type: 'MOON',
      systemSymbol: 'X1-MQ65',
      x: 15,
      y: -8,
    }

    transitShip.nav.route.arrival = '2026-09-14T10:26:06.000Z'

    server.use(
      http.get(endpoint, ({ request }) => {
        const url = new URL(request.url)

        const page = Number(url.searchParams.get('page'))

        const limit = Number(url.searchParams.get('limit'))

        return HttpResponse.json({
          data: [transitShip],

          meta: {
            page,
            limit,
            total: 1,
          },
        })
      }),
    )

    const { wrapper } = await mountFleet('/fleet?view=cards')

    await vi.waitFor(() => {
      expect(wrapper.findAll(fleetCardsSelector)).toHaveLength(1)
    })

    expect(wrapper.text()).toContain('Destination')

    expect(wrapper.text()).toContain('Expected arrival')

    expect(wrapper.get('a[aria-label="Open system X1-MQ65"]').attributes('href')).toBe(
      '/systems/X1-MQ65',
    )

    expect(wrapper.get('a[aria-label="Open waypoint X1-MQ65-B2"]').attributes('href')).toBe(
      '/systems/X1-MQ65/waypoints/X1-MQ65-B2',
    )

    expect(wrapper.get('time').attributes('datetime')).toBe('2026-09-14T10:26:06.000Z')
  })

  it('opens the selected ship details from the ship title', async () => {
    let requestedSymbol: string | undefined

    let authorization: string | null = null

    server.use(
      http.get(`${endpoint}/:symbol`, ({ params, request }) => {
        requestedSymbol = String(params.symbol)

        authorization = request.headers.get('authorization')

        return HttpResponse.json({
          data: createShip(requestedSymbol),
        })
      }),
    )

    const { wrapper, router } = await mountFleet()

    await vi.waitFor(() => {
      expect(wrapper.find('a[aria-label="Open ship TEST-1"]').exists()).toBe(true)
    })

    const shipLink = wrapper.get<HTMLAnchorElement>('a[aria-label="Open ship TEST-1"]')

    expect(shipLink.attributes('href')).toBe('/fleet/TEST-1')

    await shipLink.trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('ship-detail')

      expect(router.currentRoute.value.params.symbol).toBe('TEST-1')

      expect(wrapper.get('h1').text()).toBe('TEST-1')

      expect(wrapper.text()).toContain('Cargo hold is empty')
    })

    expect(requestedSymbol).toBe('TEST-1')

    expect(authorization).toBe('Bearer fleet-test-token')
  })

  it('loads the next page and resets the page when the limit changes', async () => {
    const { wrapper, router } = await mountFleet('/fleet?limit=1')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('TEST-1')
    })

    await wrapper.get('button[aria-label="Next ships page"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('TEST-2')

      expect(wrapper.text()).not.toContain('TEST-1')
    })

    expect(router.currentRoute.value.query.page).toBe('2')

    expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(1)

    await wrapper.get('#ships-limit').setValue('10')

    await vi.waitFor(() => {
      expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(2)
    })

    expect(router.currentRoute.value.query.page).toBe('1')

    expect(router.currentRoute.value.query.limit).toBe('10')

    expect(
      requests.map(({ page, limit }) => ({
        page,
        limit,
      })),
    ).toEqual([
      {
        page: 1,
        limit: 1,
      },
      {
        page: 2,
        limit: 1,
      },
      {
        page: 1,
        limit: 10,
      },
    ])
  })

  it('displays an empty fleet', async () => {
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

    const { wrapper } = await mountFleet()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('No ships yet')
    })

    expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(0)

    expect(wrapper.find('ul[aria-label="Fleet cards"]').exists()).toBe(false)

    expect(wrapper.find('nav[aria-label="Fleet pagination"]').exists()).toBe(false)
  })

  it('allows returning from an out-of-range page', async () => {
    const { wrapper, router } = await mountFleet('/fleet?page=99')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('No ships on this page')
    })

    await wrapper.get('button[aria-label="Return to first ships page"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('TEST-1')

      expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(2)
    })

    expect(router.currentRoute.value.query.page).toBe('1')
  })

  it('reports an invalid response instead of showing an empty fleet', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: [],
        }),
      ),
    )

    const { wrapper } = await mountFleet()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load ships')
    })

    expect(wrapper.text()).not.toContain('No ships yet')
  })

  it('keeps existing ships visible when refresh fails', async () => {
    const { wrapper } = await mountFleet()

    await vi.waitFor(() => {
      expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(2)
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

    await wrapper.get('button[aria-label="Refresh ships"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Could not refresh ships')
    })

    expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(2)

    expect(wrapper.text()).toContain('TEST-1')

    expect(wrapper.text()).toContain('TEST-2')
  })

  it('does not display old ships after logout and login with another agent', async () => {
    const { wrapper, router, queryClient } = await mountFleet()

    await vi.waitFor(() => {
      expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(2)
    })

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
          data: [createShip('OTHER-1')],

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
        expect(router.currentRoute.value.name).toBe('login')

        expect(wrapper.find('#agent-token').exists()).toBe(true)
      })

      expect(queryClient.getQueryCache().getAll()).toHaveLength(0)

      await wrapper.get('#agent-token').setValue('other-agent-token')

      await wrapper.get('form').trigger('submit')

      await vi.waitFor(() => {
        expect(router.currentRoute.value.name).toBe('agent-overview')
      })

      await router.push('/fleet')

      await vi.waitFor(() => {
        expect(authorization).toBe('Bearer other-agent-token')
      })

      await vi.waitFor(() => {
        expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(0)
      })

      expect(wrapper.text()).not.toContain('TEST-1')

      expect(wrapper.text()).not.toContain('TEST-2')

      releaseResponse?.()

      await vi.waitFor(() => {
        expect(wrapper.text()).toContain('OTHER-1')
      })

      expect(wrapper.findAll(fleetRowsSelector)).toHaveLength(1)

      expect(authorization).toBe('Bearer other-agent-token')

      expect(wrapper.text()).not.toContain('TEST-1')

      expect(wrapper.text()).not.toContain('TEST-2')
    } finally {
      releaseResponse?.()
    }
  })
})
