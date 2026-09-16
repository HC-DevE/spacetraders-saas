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

const endpoint = 'https://api.spacetraders.io/v2/my/ships/:symbol'
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
        data: createShip(String(params.symbol)),
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

async function mountShip(path = '/fleet/TEST-1') {
  const pinia = createPinia()
  const auth = useAuthStore(pinia)

  auth.setToken('ship-test-token')

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

  return { wrapper, router }
}

describe('Ship details', () => {
  it('loads the requested ship with the session token and displays its information', async () => {
    let authorization: string | null = null

    server.use(
      http.get(endpoint, ({ request }) => {
        authorization = request.headers.get('authorization')

        return HttpResponse.json({
          data: createShip(),
        })
      }),
    )

    const { wrapper } = await mountShip()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Cargo hold is empty')
    })

    expect(authorization).toBe('Bearer ship-test-token')
    expect(wrapper.get('h1').text()).toBe('TEST-1')

    expect(wrapper.text()).toContain('Frigate')
    expect(wrapper.text()).toContain('Fission Reactor I')
    expect(wrapper.text()).toContain('Ion Drive II')
    expect(wrapper.text()).toContain('X1-MQ65-A1')

    expect(wrapper.text()).toContain('No modules installed.')
    expect(wrapper.text()).toContain('No mounts installed.')
    expect(wrapper.text()).toContain('No cooldown reported')

    expect(wrapper.find('[aria-label="Ship resources"]').exists()).toBe(true)
    expect(wrapper.find('a[aria-label="View ship TEST-1"]').exists()).toBe(false)

    expect(wrapper.get('a[aria-label="Open system X1-MQ65"]').attributes('href')).toBe(
      '/systems/X1-MQ65',
    )
    expect(wrapper.get('a[aria-label="Open waypoint X1-MQ65-A1"]').attributes('href')).toBe(
      '/systems/X1-MQ65/waypoints/X1-MQ65-A1',
    )
    expect(wrapper.get('a[aria-label="Open origin waypoint X1-MQ65-A1"]').attributes('href')).toBe(
      '/systems/X1-MQ65/waypoints/X1-MQ65-A1',
    )
    expect(
      wrapper.get('a[aria-label="Open destination waypoint X1-MQ65-A1"]').attributes('href'),
    ).toBe('/systems/X1-MQ65/waypoints/X1-MQ65-A1')
  })

  it('displays cargo resources and installed equipment as readable cards', async () => {
    const ship = createShip()

    ship.cargo = {
      capacity: 40,
      units: 5,
      inventory: [
        {
          symbol: 'IRON_ORE',
          name: 'Iron Ore',
          description: 'Raw iron ore.',
          units: 5,
        },
      ],
    }

    ship.modules = [
      {
        symbol: 'MODULE_CARGO_HOLD_II',
        name: 'Expanded Cargo Hold',
        description: 'Provides additional cargo storage.',
        requirements: {
          power: 2,
          crew: 2,
          slots: 2,
        },
        capacity: 40,
      },
    ]

    ship.mounts = [
      {
        symbol: 'MOUNT_SENSOR_ARRAY_I',
        name: 'Sensor Array I',
        description: 'Detects nearby mineral deposits.',
        requirements: {
          power: 1,
          crew: 0,
        },
        strength: 2,
        deposits: ['IRON_ORE', 'COPPER_ORE'],
      },
    ]

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: ship,
        }),
      ),
    )

    const { wrapper } = await mountShip()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Expanded Cargo Hold')
    })

    expect(wrapper.text()).toContain('Iron Ore')
    expect(wrapper.get('tbody td').text()).toBe('5')

    const modulesSection = wrapper.get('section[aria-label="Modules"]')
    const moduleCard = modulesSection.get('ul > li')

    expect(moduleCard.get('h3').text()).toBe('Expanded Cargo Hold')
    expect(moduleCard.text()).toContain('Provides additional cargo storage.')
    expect(moduleCard.text()).toContain('Capacity')
    expect(moduleCard.text()).toContain('40')
    expect(moduleCard.text()).toContain('Power')
    expect(moduleCard.text()).toContain('Crew')
    expect(moduleCard.text()).toContain('Slots')
    expect(moduleCard.text()).not.toContain('MODULE_CARGO_HOLD_II')

    const mountsSection = wrapper.get('section[aria-label="Mounts"]')
    const mountCard = mountsSection.get('ul > li')

    expect(mountCard.get('h3').text()).toBe('Sensor Array I')
    expect(mountCard.text()).toContain('Strength')
    expect(mountCard.text()).toContain('Supported deposits')
    expect(mountCard.text()).toContain('iron ore')
    expect(mountCard.text()).toContain('copper ore')
    expect(mountCard.text()).not.toContain('MOUNT_SENSOR_ARRAY_I')

    expect(wrapper.text()).not.toContain('Cargo hold is empty')
    expect(wrapper.text()).not.toContain('No modules installed.')
    expect(wrapper.text()).not.toContain('No mounts installed.')
  })

  it('handles a probe and absent optional fuel and cooldown information', async () => {
    const ship = createShip('TEST-2', 'probe')

    delete ship.fuel.consumed

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: ship,
        }),
      ),
    )

    const { wrapper } = await mountShip('/fleet/TEST-2')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('No fuel tank')
    })

    expect(wrapper.get('h1').text()).toBe('TEST-2')
    expect(wrapper.text()).toContain('No cargo hold')
    expect(wrapper.text()).toContain('No crew capacity')
    expect(wrapper.text()).toContain('Not applicable')
    expect(wrapper.text()).toContain('No cooldown reported')

    expect(wrapper.text()).not.toContain('Last recorded fuel consumption:')
    expect(wrapper.text()).not.toContain('Reported expiration')
    expect(wrapper.text()).not.toContain('Crew is below the required minimum.')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('shows a specific state when the server returns 404', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          {
            error: {
              message: 'Not found',
            },
          },
          { status: 404 },
        ),
      ),
    )

    const { wrapper } = await mountShip()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Ship not found')
    })

    expect(wrapper.find('[aria-label="Ship resources"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Back to fleet')
  })

  it('rejects an incomplete response instead of displaying empty cargo', async () => {
    const ship = createShip()

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: {
            ...ship,
            cargo: {
              units: 0,
              capacity: 40,
            },
          },
        }),
      ),
    )

    const { wrapper } = await mountShip()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load ship')
    })

    expect(wrapper.text()).not.toContain('Cargo hold is empty')
    expect(wrapper.find('[aria-label="Ship resources"]').exists()).toBe(false)
  })

  it('rejects a response containing another ship', async () => {
    server.use(
      http.get(endpoint, () =>
        HttpResponse.json({
          data: createShip('OTHER-1'),
        }),
      ),
    )

    const { wrapper } = await mountShip()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('The server returned a different ship')
    })

    expect(wrapper.get('h1').text()).toBe('TEST-1')
    expect(wrapper.find('[aria-label="Ship resources"]').exists()).toBe(false)
  })

  it('loads the ship after retrying an initial error from the feedback panel', async () => {
    let requestCount = 0

    server.use(
      http.get(endpoint, () => {
        requestCount += 1

        return HttpResponse.json({ error: { message: 'Request failed' } }, { status: 400 })
      }),
    )

    const { wrapper } = await mountShip()

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load ship')
    })

    expect(wrapper.find('[aria-label="Ship resources"]').exists()).toBe(false)
    expect(requestCount).toBe(1)

    const retryButton = wrapper.get('[role="alert"]').get<HTMLButtonElement>('button')

    expect(retryButton.text()).toBe('Try again')
    expect(retryButton.element.disabled).toBe(false)

    server.use(
      http.get(endpoint, () => {
        requestCount += 1
        return HttpResponse.json({ data: createShip() })
      }),
    )

    await retryButton.trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.find('[aria-label="Ship resources"]').exists()).toBe(true)
    })

    expect(requestCount).toBe(2)
    expect(wrapper.get('h1').text()).toBe('TEST-1')
    expect(wrapper.text()).toContain('Frigate')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('preserves loaded information when a refresh fails', async () => {
    const { wrapper } = await mountShip()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Cargo hold is empty')
    })

    server.use(
      http.get(endpoint, () =>
        HttpResponse.json(
          {
            error: {
              message: 'Request failed',
            },
          },
          { status: 400 },
        ),
      ),
    )

    await wrapper.get('button[aria-label="Refresh ship"]').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('[role="alert"]').text()).toContain('Could not refresh ship')
    })

    expect(wrapper.get('h1').text()).toBe('TEST-1')
    expect(wrapper.text()).toContain('Frigate')
    expect(wrapper.text()).toContain('Cargo hold is empty')
    expect(wrapper.find('[aria-label="Ship resources"]').exists()).toBe(true)
  })

  it('shows loading without the previous ship when the route changes', async () => {
    const { wrapper, router } = await mountShip()

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Cargo hold is empty')
    })

    let releaseResponse: (() => void) | undefined

    const responseGate = new Promise<void>((resolve) => {
      releaseResponse = resolve
    })

    server.use(
      http.get(endpoint, async ({ params }) => {
        await responseGate

        return HttpResponse.json({
          data: createShip(String(params.symbol), 'probe'),
        })
      }),
    )

    try {
      await router.push('/fleet/TEST-2')

      await vi.waitFor(() => {
        expect(wrapper.get('h1').text()).toBe('TEST-2')
        expect(wrapper.text()).toContain('Loading ship')
      })

      expect(wrapper.find('[aria-label="Ship resources"]').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('Frigate')
      expect(wrapper.text()).not.toContain('TEST-1')

      releaseResponse?.()

      await vi.waitFor(() => {
        expect(wrapper.get('h1').text()).toBe('TEST-2')
        expect(wrapper.find('[aria-label="Ship resources"]').exists()).toBe(true)
        expect(wrapper.text()).toContain('No cargo hold')
      })

      expect(wrapper.text()).not.toContain('Frigate')
      expect(wrapper.text()).not.toContain('TEST-1')
    } finally {
      releaseResponse?.()
    }
  })
})
