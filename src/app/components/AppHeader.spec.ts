import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import AppHeader from '@/app/components/AppHeader.vue'
import { routeNames } from '@/app/router/route-names'

async function mountHeader(agentSymbol?: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: routeNames.agentOverview,
        component: {
          template: '<div />',
        },
      },
    ],
  })

  await router.push('/')
  await router.isReady()

  const wrapper = mount(AppHeader, {
    props: {
      agentSymbol,
    },
    global: {
      plugins: [router],
    },
  })

  return wrapper
}

describe('AppHeader', () => {
  it('links the brand to the overview', async () => {
    const wrapper = await mountHeader()

    const brand = wrapper.get('a[href="/"]')

    expect(brand.text()).toBe('Space Control')
  })

  it('displays the current agent when provided', async () => {
    const wrapper = await mountHeader('COSMIC-FOX')

    expect(wrapper.text()).toContain('Agent')

    expect(wrapper.text()).toContain('COSMIC-FOX')
  })

  it('does not display an empty agent profile', async () => {
    const wrapper = await mountHeader()

    expect(wrapper.find('[title]').exists()).toBe(false)
  })

  it('emits signOut when sign out is clicked', async () => {
    const wrapper = await mountHeader('COSMIC-FOX')

    await wrapper.get('[data-testid="logout"]').trigger('click')

    expect(wrapper.emitted('signOut')).toHaveLength(1)
  })
})
