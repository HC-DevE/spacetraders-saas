import { flushPromises, mount } from '@vue/test-utils'
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
    expect(wrapper.findAll('article')).toHaveLength(2)

    wrapper.unmount()
  })

  it('keeps previously loaded ships visible when refresh fails', async () => {
    const wrapper = await mountApplication()

    await wrapper.get('#scenario').setValue('refresh-error')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Refresh failed')
    expect(wrapper.findAll('article')).toHaveLength(2)

    await wrapper.get('[role="alert"] button').trigger('click')

    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.findAll('article')).toHaveLength(2)

    wrapper.unmount()
  })
})
