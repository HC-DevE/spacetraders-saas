<script setup lang="ts">
import { FlexRender, tableFeatures, useTable, type ColumnDef } from '@tanstack/vue-table'
import { toRef } from 'vue'

import type { Market } from '../schemas/market.schema'
import { formatDate, formatLabel, formatNumber } from '@/shared/utils/formatters'

type MarketTransaction = NonNullable<Market['transactions']>[number]

const props = defineProps<{
  transactions: MarketTransaction[]
}>()

const features = tableFeatures({})

const columns: Array<ColumnDef<typeof features, MarketTransaction>> = [
  {
    accessorKey: 'tradeSymbol',
    header: 'Good',
    cell: (info) => formatLabel(info.getValue<string>()),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: (info) => formatLabel(info.getValue<string>()),
  },
  {
    accessorKey: 'shipSymbol',
    header: 'Ship',
  },
  {
    accessorKey: 'units',
    header: 'Units',
    cell: (info) => formatNumber(info.getValue<number>()),
  },
  {
    accessorKey: 'pricePerUnit',
    header: 'Unit price',
    cell: (info) => formatNumber(info.getValue<number>()),
  },
  {
    accessorKey: 'totalPrice',
    header: 'Total',
    cell: (info) => formatNumber(info.getValue<number>()),
  },
  {
    accessorKey: 'timestamp',
    header: 'Date',
    cell: (info) => formatDate(info.getValue<string>()),
  },
]

const data = toRef(props, 'transactions')

const table = useTable({
  features,
  columns,
  data,
})

const numericColumns = new Set(['units', 'pricePerUnit', 'totalPrice'])

const labelColumns = new Set(['tradeSymbol', 'type'])
</script>

<template>
  <div class="overflow-x-auto rounded-xl border">
    <table class="w-full min-w-3xl text-left text-sm">
      <thead class="bg-muted">
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="px-4 py-3 font-medium"
            :class="{
              'text-right': numericColumns.has(header.column.id),
            }"
          >
            <FlexRender v-if="!header.isPlaceholder" :header="header" />
          </th>
        </tr>
      </thead>

      <tbody class="divide-y">
        <tr v-for="row in table.getRowModel().rows" :key="row.id">
          <td
            v-for="cell in row.getAllCells()"
            :key="cell.id"
            class="px-4 py-4"
            :class="{
              'text-right tabular-nums': numericColumns.has(cell.column.id),

              'font-medium': cell.column.id === 'tradeSymbol' || cell.column.id === 'totalPrice',

              capitalize: labelColumns.has(cell.column.id),

              'whitespace-nowrap': cell.column.id === 'timestamp',
            }"
          >
            <FlexRender :cell="cell" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
