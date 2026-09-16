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

import { createMarket } from './market.fixture'

const endpoint =
  'https://api.spacetraders.io/v2/systems/:systemSymbol/waypoints/:waypointSymbol/market'

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
        data: createMarket(String(params.waypointSymbol)),
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

async function mountMarket(path = '/systems/X1-TEST/waypoints/X1-TEST-A1/market') {
  const pinia = createPinia()
  const auth = useAuthStore(pinia)

  auth.setToken('market-test-token')

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

describe('Market page', () => {
  it('loads a complete market with the active token', async () => {
    let authorization: string | null = null
    let requestedSystem: string | undefined
    let requestedWaypoint: string | undefined

    server.use(
      http.get(endpoint, ({ params, request }) => {
        requestedSystem = String(params.systemSymbol)

        requestedWaypoint = String(params.waypointSymbol)

        authorization = request.headers.get('authorization')

        return HttpResponse.json({
          data: createMarket(requestedWaypoint),
        })
      }),
    )

    const { wrapper } = await mountMarket()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Market resources')
    })

    const tables = wrapper.findAll('table')

    expect(tables).toHaveLength(2)

    expect(tables[0]?.text()).toContain('Good')

    expect(tables[0]?.text()).toContain('Purchase')

    expect(tables[0]?.text()).toContain('Sell')

    expect(tables[0]?.text()).toContain('Not reported')

    expect(tables[1]?.text()).toContain('Ship')

    expect(tables[1]?.text()).toContain('Unit price')

    expect(tables[1]?.text()).toContain('TEST-SHIP-1')

    expect(requestedSystem).toBe('X1-TEST')
    expect(requestedWaypoint).toBe('X1-TEST-A1')

    expect(authorization).toBe('Bearer market-test-token')

    expect(wrapper.get('h1').text()).toBe('X1-TEST-A1')

    expect(wrapper.text()).toContain('Exports')
    expect(wrapper.text()).toContain('Imports')
    expect(wrapper.text()).toContain('Exchange')

    expect(wrapper.text()).toContain('Iron')
    expect(wrapper.text()).toContain('Fuel')
    expect(wrapper.text()).toContain('Food')

    expect(wrapper.text()).toContain('Trade prices')

    expect(wrapper.text()).toContain('Recent transactions')

    expect(wrapper.text()).toContain('TEST-SHIP-1')

    expect(wrapper.text()).not.toContain('Detailed prices unavailable')

    expect(wrapper.text()).not.toContain('Transaction history unavailable')

    expect(wrapper.get('a[aria-label="Back to waypoint"]').attributes('href')).toBe(
      '/systems/X1-TEST/waypoints/X1-TEST-A1',
    )

    expect(wrapper.get('a[aria-label="Open system X1-TEST"]').attributes('href')).toBe(
      '/systems/X1-TEST',
    )
  })

  it('displays structural market data when detailed prices are unavailable', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: createMarket('X1-TEST-A1', 'partial'),
        }),
      ),
    )

    const { wrapper } = await mountMarket()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Market resources')
    })

    expect(wrapper.findAll('table')).toHaveLength(0)
    expect(wrapper.text()).toContain('Iron')
    expect(wrapper.text()).toContain('Fuel')
    expect(wrapper.text()).toContain('Food')

    expect(wrapper.text()).toContain('Detailed prices unavailable')

    expect(wrapper.text()).toContain('Transaction history unavailable')

    expect(wrapper.text()).not.toContain('No priced goods reported')

    expect(wrapper.text()).not.toContain('No recent transactions')
  })

  it('distinguishes empty detailed data from unavailable detailed data', async () => {
    const market = createMarket('X1-TEST-A1', 'partial')

    market.tradeGoods = []
    market.transactions = []

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: market,
        }),
      ),
    )

    const { wrapper } = await mountMarket()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('No priced goods reported')
    })

    expect(wrapper.findAll('table')).toHaveLength(0)

    expect(wrapper.text()).toContain('No recent transactions')

    expect(wrapper.text()).not.toContain('Detailed prices unavailable')

    expect(wrapper.text()).not.toContain('Transaction history unavailable')
  })

  it('accepts a trade good without activity', async () => {
    const { wrapper } = await mountMarket()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Trade prices')
    })

    const pricesSection = wrapper
      .findAll('section')
      .find((section) => section.text().includes('Trade prices'))

    expect(pricesSection).toBeDefined()

    expect(pricesSection?.text()).toContain('Not reported')
  })

  it('rejects an incomplete market response', async () => {
    const market = createMarket('X1-TEST-A1')

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: {
            ...market,

            // Required by the official Market contract.
            imports: undefined,
          },
        }),
      ),
    )

    const { wrapper } = await mountMarket()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load market')
    })

    expect(wrapper.text()).not.toContain('Market resources')
  })

  it('rejects a market returned for another waypoint', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: createMarket('X1-OTHER-A1'),
        }),
      ),
    )

    const { wrapper } = await mountMarket()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load market')
    })

    expect(wrapper.get('[role="alert"]').text()).toContain('different waypoint')

    expect(wrapper.text()).not.toContain('Market resources')
  })

  it('shows a specific state when the market does not exist', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          {
            error: {
              code: 4603,
              message: 'Market not found',
            },
          },
          {
            status: 404,
          },
        ),
      ),
    )

    const { wrapper } = await mountMarket()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Market not found')
    })

    expect(wrapper.text()).toContain('Back to waypoint')

    expect(wrapper.text()).not.toContain('Market resources')
  })

  it('keeps loaded market data visible when refresh fails', async () => {
    const { wrapper } = await mountMarket()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Market resources')
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

    await wrapper.get('button[aria-label="Refresh market"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Could not refresh market')
    })

    expect(wrapper.text()).toContain('Market resources')

    expect(wrapper.text()).toContain('Iron')

    expect(wrapper.text()).toContain('Trade prices')

    expect(wrapper.text()).toContain('TEST-SHIP-1')
  })
})
