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
import { createWaypoint } from './waypoint.fixture'

const systemEndpoint = 'https://api.spacetraders.io/v2/systems/:systemSymbol'

const waypointsEndpoint = 'https://api.spacetraders.io/v2/systems/:systemSymbol/waypoints'

const waypointRowsSelector = 'table[aria-label="Waypoints"] tbody tr'

const server = setupServer()

let waypoints = [createWaypoint('X1-TEST-A1'), createWaypoint('X1-TEST-A2', 'uncharted')]

let systemAuthorization: string | null = null

let waypointRequests: Array<{
  page: number
  limit: number
  traits: string[]
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

  systemAuthorization = null
  waypointRequests = []

  waypoints = [createWaypoint('X1-TEST-A1'), createWaypoint('X1-TEST-A2', 'uncharted')]

  server.use(
    http.get(systemEndpoint, ({ params, request }) => {
      const systemSymbol = String(params.systemSymbol)

      systemAuthorization = request.headers.get('authorization')

      return HttpResponse.json({
        data: createSystem(systemSymbol),
      })
    }),

    http.get(waypointsEndpoint, ({ request }) => {
      const url = new URL(request.url)

      const page = Number(url.searchParams.get('page'))

      const limit = Number(url.searchParams.get('limit'))

      const traits = url.searchParams.getAll('traits')

      waypointRequests.push({
        page,
        limit,
        traits,
        authorization: request.headers.get('authorization'),
      })

      const filteredWaypoints =
        traits.length === 0
          ? waypoints
          : waypoints.filter((waypoint) =>
              traits.every((requestedTrait) =>
                waypoint.traits.some((trait) => trait.symbol === requestedTrait),
              ),
            )

      const start = (page - 1) * limit

      return HttpResponse.json({
        data: filteredWaypoints.slice(start, start + limit),

        meta: {
          page,
          limit,
          total: filteredWaypoints.length,
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

async function mountSystemDetail(path = '/systems/X1-TEST') {
  const pinia = createPinia()

  const auth = useAuthStore(pinia)

  auth.setToken('systems-test-token')

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
    queryClient,
  }
}

describe('System details', () => {
  it('loads the system and its waypoints with the active token', async () => {
    const { wrapper } = await mountSystemDetail()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('X1-TEST-A1')

      expect(wrapper.text()).toContain('X1-TEST-A2')
    })

    expect(systemAuthorization).toBe('Bearer systems-test-token')

    expect(waypointRequests).toEqual([
      {
        page: 1,
        limit: 10,
        traits: [],
        authorization: 'Bearer systems-test-token',
      },
    ])

    expect(wrapper.get('h1').text()).toBe('Test System')

    expect(wrapper.text()).toContain('X1-TEST')

    expect(wrapper.text()).toContain('System overview')

    expect(wrapper.text()).toContain('Known waypoints')

    expect(wrapper.text()).toContain('Marketplace')

    expect(wrapper.text()).toContain('Uncharted')

    expect(wrapper.findAll(waypointRowsSelector)).toHaveLength(2)
  })

  it('keeps the system visible when loading waypoints fails', async () => {
    server.use(
      http.get(waypointsEndpoint, () =>
        HttpResponse.json(
          {
            error: {
              code: 4999,
              message: 'Simulated waypoint failure',
            },
          },
          {
            status: 400,
          },
        ),
      ),
    )

    const { wrapper } = await mountSystemDetail()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load waypoints')
    })

    expect(wrapper.text()).toContain('Test System')

    expect(wrapper.text()).toContain('System overview')

    expect(wrapper.text()).toContain('X1')

    expect(wrapper.text()).toContain('Known waypoints')
  })

  it('paginates waypoints and resets to page one when the limit changes', async () => {
    waypoints = Array.from(
      {
        length: 11,
      },
      (_, index) =>
        createWaypoint(
          `X1-TEST-A${String(index + 1).padStart(2, '0')}`,
          index === 1 ? 'uncharted' : 'marketplace',
        ),
    )

    const { wrapper, router } = await mountSystemDetail('/systems/X1-TEST?limit=10')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('X1-TEST-A01')
    })

    await wrapper.get('button[aria-label="Next waypoints page"]').trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.query.page).toBe('2')

      expect(wrapper.text()).toContain('X1-TEST-A11')
    })

    expect(wrapper.findAll(waypointRowsSelector)).toHaveLength(1)

    await wrapper.get('#waypoints-limit').setValue('20')

    await vi.waitFor(() => {
      expect(wrapper.findAll(waypointRowsSelector)).toHaveLength(11)
    })

    expect(router.currentRoute.value.query.page).toBe('1')

    expect(router.currentRoute.value.query.limit).toBe('20')

    expect(
      waypointRequests.map(({ page, limit }) => ({
        page,
        limit,
      })),
    ).toEqual([
      {
        page: 1,
        limit: 10,
      },
      {
        page: 2,
        limit: 10,
      },
      {
        page: 1,
        limit: 20,
      },
    ])
  })

  it('filters marketplace waypoints and keeps the filter in the URL', async () => {
    const { wrapper, router } = await mountSystemDetail()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('X1-TEST-A2')
    })

    const marketplaceCheckbox = wrapper.get<HTMLInputElement>('input[type="checkbox"]')

    await marketplaceCheckbox.setValue(true)

    await vi.waitFor(() => {
      expect(router.currentRoute.value.query.marketplace).toBe('true')

      expect(waypointRequests[waypointRequests.length - 1]?.traits).toEqual(['MARKETPLACE'])
    })

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('X1-TEST-A1')

      expect(wrapper.text()).not.toContain('X1-TEST-A2')
    })

    expect(router.currentRoute.value.query.page).toBe('1')
  })

  it('resets waypoint pagination when the marketplace filter changes', async () => {
    waypoints = Array.from(
      {
        length: 11,
      },
      (_, index) => createWaypoint(`X1-TEST-A${String(index + 1).padStart(2, '0')}`),
    )

    const { wrapper, router } = await mountSystemDetail('/systems/X1-TEST?page=2&limit=10')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('X1-TEST-A11')
    })

    await wrapper.get<HTMLInputElement>('input[type="checkbox"]').setValue(true)

    await vi.waitFor(() => {
      expect(router.currentRoute.value.query.page).toBe('1')

      expect(router.currentRoute.value.query.marketplace).toBe('true')
    })
  })

  it('displays an uncharted waypoint without inventing hidden traits', async () => {
    const { wrapper } = await mountSystemDetail()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('X1-TEST-A2')
    })

    const waypointRows = wrapper.findAll(waypointRowsSelector)

    const unchartedRow = waypointRows.find((row) => row.text().includes('X1-TEST-A2'))

    expect(unchartedRow).toBeDefined()

    expect(unchartedRow?.text()).toContain('Uncharted')

    expect(unchartedRow?.text()).not.toContain('Marketplace')

    expect(unchartedRow?.text()).not.toContain('Trading Hub')
  })

  it('rejects an invalid waypoint response while keeping the system visible', async () => {
    const waypoint = createWaypoint('X1-TEST-A1')

    server.use(
      http.get(waypointsEndpoint, () =>
        HttpResponse.json({
          data: [
            {
              ...waypoint,

              // Required by the official Waypoint model.
              traits: undefined,
            },
          ],

          meta: {
            page: 1,
            limit: 10,
            total: 1,
          },
        }),
      ),
    )

    const { wrapper } = await mountSystemDetail()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load waypoints')
    })

    expect(wrapper.text()).toContain('Test System')

    expect(wrapper.text()).toContain('System overview')

    expect(wrapper.text()).not.toContain('No waypoints available')
  })

  it('keeps loaded waypoints visible when their refresh fails', async () => {
    const { wrapper } = await mountSystemDetail()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('X1-TEST-A1')
    })

    server.use(
      http.get(waypointsEndpoint, () =>
        HttpResponse.json(
          {
            error: {
              code: 4999,
              message: 'Refresh failed',
            },
          },
          {
            status: 400,
          },
        ),
      ),
    )

    await wrapper.get('button[aria-label="Refresh waypoints"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Could not refresh waypoints')
    })

    expect(wrapper.text()).toContain('X1-TEST-A1')

    expect(wrapper.text()).toContain('X1-TEST-A2')
  })

  it('shows a specific state when the system does not exist', async () => {
    server.use(
      http.get(systemEndpoint, () =>
        HttpResponse.json(
          {
            error: {
              code: 4040,
              message: 'System not found',
            },
          },
          {
            status: 404,
          },
        ),
      ),
    )

    const { wrapper } = await mountSystemDetail('/systems/X1-MISSING')

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('System not found')
    })

    expect(wrapper.text()).toContain('Back to systems')

    expect(wrapper.text()).not.toContain('System overview')

    expect(wrapper.text()).not.toContain('Waypoints per page')
  })

  it('rejects a system response for a different symbol', async () => {
    server.use(
      http.get(systemEndpoint, () =>
        HttpResponse.json({
          data: createSystem('X1-OTHER'),
        }),
      ),
    )

    const { wrapper } = await mountSystemDetail()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load system')
    })

    expect(wrapper.text()).not.toContain('System overview')
  })

  it('opens the selected waypoint details from the waypoint title', async () => {
    server.use(
      http.get(
        'https://api.spacetraders.io/v2/systems/:systemSymbol/waypoints/:waypointSymbol',
        ({ params }) =>
          HttpResponse.json({
            data: createWaypoint(String(params.waypointSymbol)),
          }),
      ),
    )

    const { wrapper, router } = await mountSystemDetail()

    await vi.waitFor(() => {
      expect(wrapper.find('a[aria-label="View waypoint X1-TEST-A1"]').exists()).toBe(true)
    })

    const waypointLink = wrapper.get<HTMLAnchorElement>('a[aria-label="View waypoint X1-TEST-A1"]')

    expect(waypointLink.attributes('href')).toBe('/systems/X1-TEST/waypoints/X1-TEST-A1')

    await waypointLink.trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('waypoint-detail')

      expect(router.currentRoute.value.params).toMatchObject({
        systemSymbol: 'X1-TEST',
        waypointSymbol: 'X1-TEST-A1',
      })

      expect(wrapper.text()).toContain('Waypoint overview')
    })
  })
})
