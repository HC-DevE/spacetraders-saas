import { mount } from '@vue/test-utils'
import type { Component } from 'vue'
import { describe, expect, it } from 'vitest'

import DataTable from '@/shared/components/table/DataTable.vue'
import type { DataTableColumnDef } from '@/shared/components/table/data-table'

type TestRow = {
  name: string
  count: number
}

const data: TestRow[] = [
  {
    name: 'Alpha',
    count: 12,
  },
]

const columns: DataTableColumnDef<TestRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'count',
    header: 'Count',
    meta: {
      align: 'center',
      cellClassName: 'font-mono tabular-nums',
    },
  },
]

const TestDataTable = DataTable as unknown as Component

function mountTable(
  props: {
    ariaLabel?: string
    busy?: boolean
    dimmed?: boolean
  } = {},
) {
  return mount(TestDataTable, {
    props: {
      data,
      columns,
      ...props,
    },
  })
}

describe('DataTable', () => {
  it('renders headers and rows', () => {
    const wrapper = mountTable({
      ariaLabel: 'Test data',
    })

    expect(wrapper.find('table[aria-label="Test data"]').exists()).toBe(true)

    expect(wrapper.text()).toContain('Name')

    expect(wrapper.text()).toContain('Count')

    expect(wrapper.text()).toContain('Alpha')

    expect(wrapper.text()).toContain('12')
  })

  it('uses the same alignment for a column header and its cells', () => {
    const wrapper = mountTable()

    const headers = wrapper.findAll('thead th')

    const cells = wrapper.findAll('tbody td')

    expect(headers[1]?.classes()).toContain('text-center')

    expect(cells[1]?.classes()).toContain('text-center')

    expect(cells[1]?.classes()).toContain('font-mono')

    expect(cells[1]?.classes()).toContain('tabular-nums')
  })

  it('exposes the busy state on the table', () => {
    const wrapper = mountTable({
      busy: true,
    })

    expect(wrapper.get('table').attributes('aria-busy')).toBe('true')
  })

  it('dims previously loaded data when requested', () => {
    const wrapper = mountTable({
      dimmed: true,
    })

    const container = wrapper.get('table').element.parentElement

    expect(container?.classList.contains('opacity-60')).toBe(true)
  })
})
