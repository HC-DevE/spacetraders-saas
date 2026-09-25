<script setup lang="ts" generic="TData extends RowData">
import { FlexRender, useTable, type RowData } from '@tanstack/vue-table'
import { toRef } from 'vue'

import { dataTableFeatures, type DataTableAlign, type DataTableColumnDef } from './data-table'

const props = defineProps<{
  data: TData[]
  columns: DataTableColumnDef<TData>[]
  ariaLabel?: string
  minWidth?: string
  busy?: boolean
  dimmed?: boolean
}>()

const data = toRef(props, 'data')

const table = useTable<typeof dataTableFeatures, TData>({
  features: dataTableFeatures,
  columns: props.columns,
  data,
})

function getAlignmentClass(align?: DataTableAlign): string {
  switch (align) {
    case 'center':
      return 'text-center'

    case 'right':
      return 'text-right'

    default:
      return 'text-left'
  }
}
</script>

<template>
  <div
    class="overflow-x-auto border border-border bg-card"
    :class="{
      'opacity-60': dimmed,
    }"
  >
    <table
      class="w-full table-fixed text-sm"
      :aria-label="ariaLabel"
      :aria-busy="busy ? 'true' : undefined"
      :style="{
        minWidth: minWidth ?? '48rem',
      }"
    >
      <thead class="border-b border-border bg-background">
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            scope="col"
            class="px-4 py-3 text-xs font-medium text-muted-foreground"
            :class="[
              getAlignmentClass(header.column.columnDef.meta?.align),
              header.column.columnDef.meta?.className,
              header.column.columnDef.meta?.headerClassName,
            ]"
          >
            <FlexRender v-if="!header.isPlaceholder" :header="header" />
          </th>
        </tr>
      </thead>

      <tbody class="divide-y divide-border">
        <tr
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          class="group bg-card transition-colors hover:bg-background"
        >
          <td
            v-for="cell in row.getAllCells()"
            :key="cell.id"
            class="px-4 py-4 align-middle"
            :class="[
              getAlignmentClass(cell.column.columnDef.meta?.align),
              cell.column.columnDef.meta?.className,
              cell.column.columnDef.meta?.cellClassName,
            ]"
          >
            <FlexRender :cell="cell" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
