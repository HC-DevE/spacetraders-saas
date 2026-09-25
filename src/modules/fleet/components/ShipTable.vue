<script setup lang="ts">
import DataTable from '@/shared/components/table/DataTable.vue'

import type { Ship } from '../schemas/ship.schema'
import { shipColumns } from './ship-table.columns'

defineProps<{
  ships: Ship[]
  isFetching: boolean
  isPlaceholderData: boolean
}>()
</script>

<template>
  <DataTable
    :data="ships"
    :columns="shipColumns"
    aria-label="Fleet"
    min-width="64rem"
    :busy="isFetching"
    :dimmed="isPlaceholderData"
  />
</template>
