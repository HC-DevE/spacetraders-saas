<script setup lang="ts">
import { h } from 'vue'

import type { DataTableColumnDef } from '@/shared/components/table/data-table'
import DataTable from '@/shared/components/table/DataTable.vue'
import { formatDate, formatLabel, formatNumber } from '@/shared/utils/formatters'

import type { Market } from '../schemas/market.schema'

type MarketTransaction = NonNullable<Market['transactions']>[number]

defineProps<{
  transactions: MarketTransaction[]
}>()

const columns: DataTableColumnDef<MarketTransaction>[] = [
  {
    accessorKey: 'tradeSymbol',
    header: 'Good',

    meta: {
      className: 'w-44',
      headerClassName: 'sticky left-0 z-20 border-r border-border bg-background',
      cellClassName:
        'sticky left-0 z-10 border-r border-border bg-card font-medium capitalize transition-colors group-hover:bg-background',
    },

    cell: ({ row }) => formatLabel(row.original.tradeSymbol),
  },

  {
    accessorKey: 'type',
    header: 'Type',

    meta: {
      className: 'w-28',
      cellClassName: 'capitalize',
    },

    cell: ({ row }) => formatLabel(row.original.type),
  },

  {
    accessorKey: 'shipSymbol',
    header: 'Ship',

    meta: {
      className: 'w-44',
      cellClassName: 'font-mono text-xs',
    },
  },

  {
    accessorKey: 'units',
    header: 'Units',

    meta: {
      align: 'right',
      className: 'w-24',
      cellClassName: 'font-mono tabular-nums',
    },

    cell: ({ row }) => formatNumber(row.original.units),
  },

  {
    accessorKey: 'pricePerUnit',
    header: 'Unit price',

    meta: {
      align: 'right',
      className: 'w-32',
      cellClassName: 'font-mono tabular-nums',
    },

    cell: ({ row }) => formatNumber(row.original.pricePerUnit),
  },

  {
    accessorKey: 'totalPrice',
    header: 'Total',

    meta: {
      align: 'right',
      className: 'w-32',
      cellClassName: 'font-mono font-medium tabular-nums',
    },

    cell: ({ row }) => formatNumber(row.original.totalPrice),
  },

  {
    accessorKey: 'timestamp',
    header: 'Date',

    meta: {
      className: 'w-52',
      cellClassName: 'whitespace-nowrap',
    },

    cell: ({ row }) =>
      h(
        'time',
        {
          datetime: row.original.timestamp,
          class: 'font-mono text-xs text-muted-foreground',
        },
        formatDate(row.original.timestamp),
      ),
  },
]
</script>

<template>
  <DataTable
    :data="transactions"
    :columns="columns"
    aria-label="Market transactions"
    min-width="64rem"
  />
</template>
