import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import AppButton from '@/shared/components/AppButton.vue'

describe('AppButton', () => {
  it('does not submit a form by default and forwards clicks', async () => {
    const onClick = vi.fn<(event: MouseEvent) => void>()

    const wrapper = mount(AppButton, {
      attrs: { onClick },
      slots: { default: 'Connect' },
    })

    expect(wrapper.get('button').attributes('type')).toBe('button')

    await wrapper.get('button').trigger('click')

    expect(onClick).toHaveBeenCalledOnce()

    wrapper.unmount()
  })

  it('blocks clicks and exposes loading feedback while busy', async () => {
    const onClick = vi.fn<(event: MouseEvent) => void>()

    const wrapper = mount(AppButton, {
      props: {
        loading: true,
        loadingLabel: 'Connecting…',
      },
      attrs: { onClick },
      slots: { default: 'Connect' },
    })

    const button = wrapper.get('button')

    expect(button.element.disabled).toBe(true)
    expect(button.attributes('aria-busy')).toBe('true')
    expect(button.text()).toContain('Connecting…')

    await button.trigger('click')

    expect(onClick).not.toHaveBeenCalled()

    await wrapper.setProps({ loading: false })

    expect(button.element.disabled).toBe(false)
    expect(button.attributes('aria-busy')).toBeUndefined()
    expect(button.text()).toBe('Connect')

    await button.trigger('click')

    expect(onClick).toHaveBeenCalledOnce()

    wrapper.unmount()
  })
})
