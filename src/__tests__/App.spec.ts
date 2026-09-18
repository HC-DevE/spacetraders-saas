import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import App from '../App.vue'
import DesignSystemPage from '../app/pages/DesignSystemPage.vue'

async function mountApplication() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/design-system',
        component: DesignSystemPage,
      },
    ],
  })

  await router.push('/design-system')
  await router.isReady()

  return mount(App, {
    global: {
      plugins: [router],
    },
  })
}

describe('Design system integration', () => {
  it('renders the page through the application router', async () => {
    const wrapper = await mountApplication()

    expect(wrapper.get('h1').text()).toBe('Design system')
    expect(wrapper.get('#foundations-title').text()).toBe('Foundations')
    expect(wrapper.get('#actions-title').text()).toBe('Actions')
    expect(wrapper.get('#inputs-title').text()).toBe('Inputs')
    expect(wrapper.get('#feedback-title').text()).toBe('Feedback')
    expect(wrapper.get('#data-display-title').text()).toBe('Data display')
    expect(wrapper.get('#structured-surfaces-title').text()).toBe('Structured surfaces')

    wrapper.unmount()
  })

  it('renders the shared data table reference', async () => {
    const wrapper = await mountApplication()

    const table = wrapper.get('table[aria-label="Design system data table"]')

    expect(table.findAll('tbody tr')).toHaveLength(3)
    expect(table.text()).toContain('EXPLORER-1')
    expect(table.text()).toContain('EXPLORER-2')
    expect(table.text()).toContain('EXPLORER-3')

    wrapper.unmount()
  })
})
