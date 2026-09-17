import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import AppNavigation from '@/app/components/AppNavigation.vue'
import { navigationSections } from '@/app/navigation/main-navigation'
import { routeNames } from '@/app/router/route-names'

async function mountNavigation(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: routeNames.agentOverview,
        component: {
          template: '<div />',
        },
        meta: {
          navigationSection: navigationSections.overview,
        },
      },
      {
        path: '/fleet',
        name: routeNames.fleet,
        component: {
          template: '<div />',
        },
        meta: {
          navigationSection: navigationSections.fleet,
        },
      },
      {
        path: '/fleet/:symbol',
        name: routeNames.shipDetail,
        component: {
          template: '<div />',
        },
        meta: {
          navigationSection: navigationSections.fleet,
        },
      },
      {
        path: '/systems',
        name: routeNames.systems,
        component: {
          template: '<div />',
        },
        meta: {
          navigationSection: navigationSections.systems,
        },
      },
      {
        path: '/systems/:systemSymbol/waypoints/:waypointSymbol/market',
        name: routeNames.market,
        component: {
          template: '<div />',
        },
        meta: {
          navigationSection: navigationSections.systems,
        },
      },
    ],
  })

  await router.push(path)
  await router.isReady()

  return mount(AppNavigation, {
    global: {
      plugins: [router],
    },
  })
}

describe('AppNavigation', () => {
  it('renders the application sections', async () => {
    const wrapper = await mountNavigation('/')

    expect(wrapper.text()).toContain('Overview')
    expect(wrapper.text()).toContain('Fleet')
    expect(wrapper.text()).toContain('Systems')
  })

  it('marks Fleet as the current page on the fleet route', async () => {
    const wrapper = await mountNavigation('/fleet')

    expect(wrapper.get('a[href="/fleet"]').attributes('aria-current')).toBe('page')
  })

  it('keeps Fleet active on a ship detail', async () => {
    const wrapper = await mountNavigation('/fleet/TEST-1')

    expect(wrapper.get('a[href="/fleet"]').attributes('aria-current')).toBe('location')
  })

  it('keeps Systems active on a market route', async () => {
    const wrapper = await mountNavigation('/systems/X1-TEST/waypoints/X1-TEST-A1/market')

    expect(wrapper.get('a[href="/systems"]').attributes('aria-current')).toBe('location')
  })
})
