import { onlineManager, VueQueryPlugin } from '@tanstack/vue-query'
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
const storageKey = 'space-control.agent-token'
const server = setupServer()

const pages = [
  { name: 'fleet', path: '/fleet', endpoint, refreshLabel: 'Refresh ships' },
  {
    name: 'ship detail',
    path: '/fleet/TEST-1',
    endpoint: `${endpoint}/TEST-1`,
    refreshLabel: 'Refresh ship',
  },
]

let ship = createShip()
let requestCount = 0
let cleanup: (() => void) | undefined

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
  localStorage.clear()
  onlineManager.setOnline(true)
  ship = createShip()
  requestCount = 0

  server.use(
    http.get(endpoint, () => {
      requestCount += 1
      return HttpResponse.json({
        data: [ship],
        meta: { page: 1, limit: 10, total: 1 },
      })
    }),
    http.get(`${endpoint}/TEST-1`, () => {
      requestCount += 1
      return HttpResponse.json({ data: ship })
    }),
  )
})

afterEach(() => {
  cleanup?.()
  cleanup = undefined
  server.resetHandlers()
  onlineManager.setOnline(true)
  localStorage.clear()
})

afterAll(() => {
  server.close()
})

async function mountPage(path: string) {
  const pinia = createPinia()
  const auth = useAuthStore(pinia)
  auth.setToken('fleet-test-token')

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
  return { wrapper, router, auth, queryClient }
}

describe.each(pages)('$name states', (page) => {
  it.each([
    { status: 401, code: 4000 },
    { status: 400, code: 4105 },
  ])('clears loaded data and returns to login after HTTP $status / code $code', async (failure) => {
    const { wrapper, router, auth, queryClient } = await mountPage(page.path)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Frigate')
    })

    expect(queryClient.getQueryCache().getAll().length).toBeGreaterThan(0)

    server.use(
      http.get(page.endpoint, () => {
        requestCount += 1

        return HttpResponse.json(
          { error: { code: failure.code, message: 'Token rejected' } },
          { status: failure.status },
        )
      }),
    )

    await wrapper.get(`button[aria-label="${page.refreshLabel}"]`).trigger('click')

    await vi.waitFor(() => {
      expect(router.currentRoute.value.name).toBe('login')
      expect(wrapper.find('#agent-token').exists()).toBe(true)
    })

    expect(auth.hasToken).toBe(false)
    expect(localStorage.getItem(storageKey)).toBeNull()
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    expect(wrapper.text()).not.toContain('TEST-1')
    expect(wrapper.text()).not.toContain('Frigate')
    expect(requestCount).toBe(2)
  })

  it('waits offline before the first request and loads after reconnecting', async () => {
    onlineManager.setOnline(false)
    const { wrapper } = await mountPage(page.path)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Waiting for')
    })

    expect(requestCount).toBe(0)
    expect(wrapper.text()).not.toContain('Frigate')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)

    onlineManager.setOnline(true)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Frigate')
    })

    expect(requestCount).toBe(1)
    expect(wrapper.text()).not.toContain('Waiting for')
  })

  it('keeps loaded data while refresh is paused and resumes after reconnecting', async () => {
    const { wrapper } = await mountPage(page.path)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Frigate')
    })

    onlineManager.setOnline(false)
    await wrapper.get(`button[aria-label="${page.refreshLabel}"]`).trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.text().toLowerCase()).toContain('waiting for')
    })

    expect(requestCount).toBe(1)
    expect(wrapper.text()).toContain('Frigate')

    ship.registration.name = 'Updated ship name'
    onlineManager.setOnline(true)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Updated ship name')
    })

    expect(requestCount).toBe(2)
    expect(wrapper.text().toLowerCase()).not.toContain('waiting for')
  })

  it('keeps the session and loaded data when refresh is rate limited', async () => {
    const { wrapper, router, auth } = await mountPage(page.path)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Frigate')
    })

    server.use(
      http.get(page.endpoint, () => {
        requestCount += 1
        return HttpResponse.json(
          { error: { code: 429, message: 'Too many requests' } },
          { status: 429 },
        )
      }),
    )

    await wrapper.get(`button[aria-label="${page.refreshLabel}"]`).trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Too many requests')
    })

    expect(auth.hasToken).toBe(true)
    expect(router.currentRoute.value.path).toBe(page.path)
    expect(wrapper.text()).toContain('Frigate')
    expect(requestCount).toBe(2)
  })

  it('displays the destination and expected arrival while in transit', async () => {
    ship.nav.status = 'IN_TRANSIT'
    ship.nav.route.destination.symbol = 'X1-MQ65-B2'
    ship.nav.route.arrival = '2026-09-14T10:26:06.000Z'

    const { wrapper } = await mountPage(page.path)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('In transit')
    })

    expect(wrapper.text()).toContain('Destination')
    expect(wrapper.text()).toContain('X1-MQ65-B2')
    expect(wrapper.text()).toContain('Expected arrival')
    expect(wrapper.find('time[datetime="2026-09-14T10:26:06.000Z"]').exists()).toBe(true)
  })
})

describe('Ship resource warnings', () => {
  it('reports empty fuel and insufficient crew, then clears the warnings after refresh', async () => {
    ship.fuel.current = 0
    ship.crew.current = ship.crew.required - 1

    const { wrapper } = await mountPage('/fleet/TEST-1')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Fuel tank is empty.')
      expect(wrapper.text()).toContain('Crew is below the required minimum.')
    })

    expect(wrapper.text()).not.toContain('No fuel tank')

    ship.fuel.current = ship.fuel.capacity
    ship.crew.current = ship.crew.required
    await wrapper.get('button[aria-label="Refresh ship"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.text()).not.toContain('Fuel tank is empty.')
      expect(wrapper.text()).not.toContain('Crew is below the required minimum.')
    })

    expect(requestCount).toBe(2)
  })
})

describe('Fleet pagination loading', () => {
  it('keeps the previous page visible while the next page is loading', async () => {
    const secondShip = createShip('TEST-2', 'probe')
    let releaseResponse: (() => void) | undefined

    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve
    })

    server.use(
      http.get(endpoint, async ({ request }) => {
        requestCount += 1
        const page = Number(new URL(request.url).searchParams.get('page'))

        if (page === 2) await responseGate

        return HttpResponse.json({
          data: [page === 1 ? ship : secondShip],
          meta: { page, limit: 1, total: 2 },
        })
      }),
    )

    try {
      const { wrapper, router } = await mountPage('/fleet?limit=1')

      await vi.waitFor(() => {
        expect(wrapper.text()).toContain('Frigate')
      })

      await wrapper.get('button[aria-label="Next ships page"]').trigger('click')

      await vi.waitFor(() => {
        expect(router.currentRoute.value.query.page).toBe('2')
        expect(wrapper.text()).toContain('Loading page 2.')
      })

      expect(wrapper.text()).toContain('Results from page 1 are still displayed.')
      expect(wrapper.text()).toContain('TEST-1')
      expect(wrapper.text()).not.toContain('TEST-2')

      expect(
        wrapper.get<HTMLButtonElement>('button[aria-label="Next ships page"]').element.disabled,
      ).toBe(true)

      releaseResponse?.()

      await vi.waitFor(() => {
        expect(wrapper.text()).toContain('TEST-2')
        expect(wrapper.text()).not.toContain('TEST-1')
      })

      expect(wrapper.text()).not.toContain('Results from page 1 are still displayed.')
      expect(requestCount).toBe(2)
    } finally {
      releaseResponse?.()
    }
  })
})
