import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ViewModeToggle from '@/shared/components/view-mode/ViewModeToggle.vue'
import { parseViewMode, viewModes } from '@/shared/components/view-mode/view-mode'

describe('parseViewMode', () => {
  it('accepts the cards view mode', () => {
    expect(parseViewMode('cards')).toBe(viewModes.cards)
  })

  it('falls back to table for every other value', () => {
    expect(parseViewMode('table')).toBe(viewModes.table)
    expect(parseViewMode('invalid')).toBe(viewModes.table)
    expect(parseViewMode(undefined)).toBe(viewModes.table)
    expect(parseViewMode(null)).toBe(viewModes.table)
    expect(parseViewMode(['cards'])).toBe(viewModes.table)
  })
})

describe('ViewModeToggle', () => {
  it('exposes the current view mode accessibly', () => {
    const wrapper = mount(ViewModeToggle, {
      props: {
        modelValue: viewModes.table,
      },
    })

    const group = wrapper.get('[role="group"][aria-label="View mode"]')

    const tableButton = group.get('button[aria-label="Show table view"]')

    const cardsButton = group.get('button[aria-label="Show cards view"]')

    expect(tableButton.attributes('aria-pressed')).toBe('true')
    expect(cardsButton.attributes('aria-pressed')).toBe('false')

    expect(tableButton.text()).toContain('Table')
    expect(cardsButton.text()).toContain('Cards')

    wrapper.unmount()
  })

  it('emits the selected view mode', async () => {
    const wrapper = mount(ViewModeToggle, {
      props: {
        modelValue: viewModes.table,
      },
    })

    await wrapper.get('button[aria-label="Show cards view"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[viewModes.cards]])

    wrapper.unmount()
  })

  it('does not emit when the active view mode is selected again', async () => {
    const wrapper = mount(ViewModeToggle, {
      props: {
        modelValue: viewModes.table,
      },
    })

    await wrapper.get('button[aria-label="Show table view"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('updates the pressed state when the model changes', async () => {
    const wrapper = mount(ViewModeToggle, {
      props: {
        modelValue: viewModes.table,
      },
    })

    await wrapper.setProps({
      modelValue: viewModes.cards,
    })

    expect(wrapper.get('button[aria-label="Show table view"]').attributes('aria-pressed')).toBe(
      'false',
    )

    expect(wrapper.get('button[aria-label="Show cards view"]').attributes('aria-pressed')).toBe(
      'true',
    )

    wrapper.unmount()
  })
})
