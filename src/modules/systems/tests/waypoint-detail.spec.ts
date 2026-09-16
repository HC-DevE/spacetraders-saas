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

import { createWaypoint } from './waypoint.fixture'
import { createMarket } from '@/modules/markets/tests/market.fixture'

const endpoint = 'https://api.spacetraders.io/v2/systems/:systemSymbol/waypoints/:waypointSymbol'

const server = setupServer()

let cleanup: (() => void) | undefined

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  localStorage.clear()

  server.use(
    http.get(endpoint, ({ params }) =>
      HttpResponse.json({
        data: createWaypoint(String(params.waypointSymbol)),
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

async function mountWaypoint(path = '/systems/X1-TEST/waypoints/X1-TEST-A1') {
  const pinia = createPinia()
  const auth = useAuthStore(pinia)

  auth.setToken('waypoint-test-token')

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
  }
}

describe('Waypoint details', () => {
  it('loads the requested waypoint with the active token', async () => {
    let authorization: string | null = null
    let requestedSystem: string | undefined
    let requestedWaypoint: string | undefined

    server.use(
      http.get(endpoint, ({ params, request }) => {
        requestedSystem = String(params.systemSymbol)

        requestedWaypoint = String(params.waypointSymbol)

        authorization = request.headers.get('authorization')

        return HttpResponse.json({
          data: createWaypoint(requestedWaypoint),
        })
      }),
    )

    const { wrapper } = await mountWaypoint()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Waypoint overview')
    })

    expect(requestedSystem).toBe('X1-TEST')
    expect(requestedWaypoint).toBe('X1-TEST-A1')

    expect(authorization).toBe('Bearer waypoint-test-token')

    expect(wrapper.get('h1').text()).toBe('X1-TEST-A1')

    expect(wrapper.text()).toContain('Marketplace')

    expect(wrapper.text()).toContain('Available')

    expect(wrapper.text()).toContain('Marketplace')

    expect(wrapper.text()).toContain('Trading Hub')

    expect(wrapper.text()).toContain('A marketplace where goods can be traded.')

    expect(wrapper.text()).toContain('Chart information')

    expect(wrapper.text()).toContain('TEST')

    expect(wrapper.get('a[aria-label="Back to system"]').attributes('href')).toBe(
      '/systems/X1-TEST',
    )

    expect(wrapper.get('a[aria-label="Open system X1-TEST"]').attributes('href')).toBe(
      '/systems/X1-TEST',
    )
    expect(
      wrapper.get('a[aria-label="Open orbital waypoint X1-TEST-A1-MOON"]').attributes('href'),
    ).toBe('/systems/X1-TEST/waypoints/X1-TEST-A1-MOON')
  })

  it('links a parent orbit when the waypoint reports one', async () => {
    const waypoint = createWaypoint('X1-TEST-A1')
    waypoint.orbits = 'X1-TEST-PARENT'

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: waypoint,
        }),
      ),
    )

    const { wrapper } = await mountWaypoint()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Waypoint overview')
    })

    expect(
      wrapper.get('a[aria-label="Open parent waypoint X1-TEST-PARENT"]').attributes('href'),
    ).toBe('/systems/X1-TEST/waypoints/X1-TEST-PARENT')
  })

  it('displays modifiers and chart information when provided', async () => {
    const waypoint = createWaypoint('X1-TEST-A1')

    waypoint.modifiers = [
      {
        symbol: 'STRIPPED',
        name: 'Stripped',
        description: 'This waypoint has been stripped of useful resources.',
      },
    ]

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: waypoint,
        }),
      ),
    )

    const { wrapper } = await mountWaypoint()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Active modifiers')
    })

    expect(wrapper.text()).toContain('Stripped')

    expect(wrapper.text()).toContain('This waypoint has been stripped of useful resources.')

    expect(wrapper.text()).toContain('Chart information')

    expect(wrapper.text()).toContain('Submitted by')
  })

  it('treats marketplace availability as unknown for an uncharted waypoint', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: createWaypoint('X1-TEST-A2', 'uncharted'),
        }),
      ),
    )

    const { wrapper } = await mountWaypoint('/systems/X1-TEST/waypoints/X1-TEST-A2')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Uncharted')
    })

    const marketplaceMetric = wrapper
      .findAll('dl > div')
      .find((node) => node.text().includes('Marketplace'))

    expect(marketplaceMetric).toBeDefined()
    expect(marketplaceMetric?.text()).toContain('Unknown')

    expect(wrapper.text()).not.toContain('No marketplace trait')
  })

  it('rejects an incomplete waypoint response', async () => {
    const waypoint = createWaypoint('X1-TEST-A1')

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: {
            ...waypoint,

            // Required by the official Waypoint contract.
            traits: undefined,
          },
        }),
      ),
    )

    const { wrapper } = await mountWaypoint()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load waypoint')
    })

    expect(wrapper.text()).not.toContain('Waypoint overview')
  })

  it('rejects a response for another waypoint or system', async () => {
    const waypoint = createWaypoint('X1-OTHER-A1')

    waypoint.systemSymbol = 'X1-OTHER'

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: waypoint,
        }),
      ),
    )

    const { wrapper } = await mountWaypoint()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load waypoint')
    })

    expect(wrapper.get('[role="alert"]').text()).toContain('different waypoint')

    expect(wrapper.text()).not.toContain('Waypoint overview')
  })

  it('shows a specific state when the waypoint does not exist', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          {
            error: {
              message: 'Waypoint not found',
            },
          },
          {
            status: 404,
          },
        ),
      ),
    )

    const { wrapper } = await mountWaypoint('/systems/X1-TEST/waypoints/X1-MISSING')

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Waypoint not found')
    })

    expect(wrapper.text()).toContain('Back to system')

    expect(wrapper.text()).not.toContain('Waypoint overview')
  })

  it('loads the waypoint after retrying an initial error', async () => {
    let requestCount = 0

    server.use(
      http.get(endpoint, () => {
        requestCount += 1

        return HttpResponse.json(
          {
            error: {
              message: 'Request failed',
            },
          },
          {
            status: 400,
          },
        )
      }),
    )

    const { wrapper } = await mountWaypoint()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load waypoint')
    })

    expect(requestCount).toBe(1)

    server.use(
      http.get(endpoint, () => {
        requestCount += 1

        return HttpResponse.json({
          data: createWaypoint('X1-TEST-A1'),
        })
      }),
    )

    const retryButton = wrapper.get('[role="alert"]').get<HTMLButtonElement>('button')

    expect(retryButton.text()).toBe('Try again')

    await retryButton.trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Waypoint overview')
    })

    expect(requestCount).toBe(2)

    expect(wrapper.get('h1').text()).toBe('X1-TEST-A1')

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('preserves loaded information when a refresh fails', async () => {
    const { wrapper } = await mountWaypoint()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Waypoint overview')
    })

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          {
            error: {
              message: 'Refresh failed',
            },
          },
          {
            status: 400,
          },
        ),
      ),
    )

    await wrapper.get('button[aria-label="Refresh waypoint"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Could not refresh waypoint')
    })

    expect(wrapper.get('h1').text()).toBe('X1-TEST-A1')

    expect(wrapper.text()).toContain('Waypoint overview')

    expect(wrapper.text()).toContain('Marketplace')

    expect(wrapper.text()).toContain('Trading Hub')
  })

  it('opens the market when the waypoint has a marketplace', async () => {
    server.use(
      http.get(
        'https://api.spacetraders.io/v2/systems/:systemSymbol/waypoints/:waypointSymbol/market',
        ({ params }) =>
          HttpResponse.json({
            data: {
              ...createMarket(String(params.waypointSymbol)),
            },
          }),
      ),
    )

    const { wrapper, router } = await mountWaypoint()

    await vi.waitFor(() => {
      expect(wrapper.find('button[aria-label="Open waypoint market"]').exists()).toBe(true)
    })

    await wrapper.get('button[aria-label="Open waypoint market"]').trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('market')

      expect(router.currentRoute.value.params).toMatchObject({
        systemSymbol: 'X1-TEST',
        waypointSymbol: 'X1-TEST-A1',
      })

      expect(wrapper.text()).toContain('Market resources')
    })
  })

  it('does not expose market navigation for an uncharted waypoint', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: createWaypoint('X1-TEST-A2', 'uncharted'),
        }),
      ),
    )

    const { wrapper } = await mountWaypoint('/systems/X1-TEST/waypoints/X1-TEST-A2')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Uncharted')
    })

    expect(wrapper.find('button[aria-label="Open waypoint market"]').exists()).toBe(false)

    expect(wrapper.text()).toContain('Unknown')
  })
})
