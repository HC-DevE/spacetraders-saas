<script setup lang="ts">
import type { DataTableColumnDef } from '@/shared/components/table/data-table'
import DataTable from '@/shared/components/table/DataTable.vue'
import { formatLabel, formatNumber } from '@/shared/utils/formatters'

import type { Market } from '../schemas/market.schema'

type MarketTradeGood = NonNullable<Market['tradeGoods']>[number]

defineProps<{
  goods: MarketTradeGood[]
}>()

const columns: DataTableColumnDef<MarketTradeGood>[] = [
  {
    accessorKey: 'symbol',
    header: 'Good',

    meta: {
      className: 'w-48',
      headerClassName: 'sticky left-0 z-20 border-r border-border bg-background',
      cellClassName:
        'sticky left-0 z-10 border-r border-border bg-card font-medium capitalize transition-colors group-hover:bg-background',
    },

    cell: ({ row }) => formatLabel(row.original.symbol),
  },

  {
    accessorKey: 'type',
    header: 'Type',

    meta: {
      className: 'w-32',
      cellClassName: 'capitalize',
    },

    cell: ({ row }) => formatLabel(row.original.type),
  },

  {
    accessorKey: 'supply',
    header: 'Supply',

    meta: {
      className: 'w-32',
      cellClassName: 'capitalize',
    },

    cell: ({ row }) => formatLabel(row.original.supply),
  },

  {
    accessorKey: 'activity',
    header: 'Activity',

    meta: {
      className: 'w-36',
      cellClassName: 'capitalize',
    },

    cell: ({ row }) =>
      row.original.activity ? formatLabel(row.original.activity) : 'Not reported',
  },

  {
    accessorKey: 'tradeVolume',
    header: 'Volume',

    meta: {
      align: 'right',
      className: 'w-28',
      cellClassName: 'font-mono tabular-nums',
    },

    cell: ({ row }) => formatNumber(row.original.tradeVolume),
  },

  {
    accessorKey: 'purchasePrice',
    header: 'Purchase',

    meta: {
      align: 'right',
      className: 'w-32',
      cellClassName: 'font-mono font-medium tabular-nums',
    },

    cell: ({ row }) => formatNumber(row.original.purchasePrice),
  },

  {
    accessorKey: 'sellPrice',
    header: 'Sell',

    meta: {
      align: 'right',
      className: 'w-32',
      cellClassName: 'font-mono font-medium tabular-nums',
    },

    cell: ({ row }) => formatNumber(row.original.sellPrice),
  },
]
</script>

<template>
  <DataTable :data="goods" :columns="columns" aria-label="Market trade prices" min-width="60rem" />
</template>
