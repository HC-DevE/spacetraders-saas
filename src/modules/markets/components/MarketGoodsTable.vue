<script setup lang="ts">
import { FlexRender, tableFeatures, useTable, type ColumnDef } from '@tanstack/vue-table'
import { toRef } from 'vue'

import type { Market } from '../schemas/market.schema'
import { formatLabel, formatNumber } from '@/shared/utils/formatters'

type MarketTradeGood = NonNullable<Market['tradeGoods']>[number]

const props = defineProps<{
  goods: MarketTradeGood[]
}>()

const features = tableFeatures({})

const columns: Array<ColumnDef<typeof features, MarketTradeGood>> = [
  {
    accessorKey: 'symbol',
    header: 'Good',
    cell: (info) => formatLabel(info.getValue<string>()),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: (info) => formatLabel(info.getValue<string>()),
  },
  {
    accessorKey: 'supply',
    header: 'Supply',
    cell: (info) => formatLabel(info.getValue<string>()),
  },
  {
    accessorKey: 'activity',
    header: 'Activity',
    cell: (info) => {
      const activity = info.getValue<string | undefined>()

      return activity ? formatLabel(activity) : 'Not reported'
    },
  },
  {
    accessorKey: 'tradeVolume',
    header: 'Volume',
    cell: (info) => formatNumber(info.getValue<number>()),
  },
  {
    accessorKey: 'purchasePrice',
    header: 'Purchase',
    cell: (info) => formatNumber(info.getValue<number>()),
  },
  {
    accessorKey: 'sellPrice',
    header: 'Sell',
    cell: (info) => formatNumber(info.getValue<number>()),
  },
]

const data = toRef(props, 'goods')

const table = useTable({
  features,
  columns,
  data,
})

const numericColumns = new Set(['tradeVolume', 'purchasePrice', 'sellPrice'])

const labelColumns = new Set(['symbol', 'type', 'supply', 'activity'])
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
              'font-medium':
                cell.column.id === 'symbol' ||
                cell.column.id === 'purchasePrice' ||
                cell.column.id === 'sellPrice',
              capitalize: labelColumns.has(cell.column.id),
            }"
          >
            <FlexRender :cell="cell" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
