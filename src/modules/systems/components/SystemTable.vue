<script setup lang="ts">
import DataTable from '@/shared/components/table/DataTable.vue'

import type { System } from '../schemas/system.schema'
import { systemColumns } from './system-table.columns'

defineProps<{
  systems: System[]
  isFetching: boolean
  isPlaceholderData: boolean
}>()
</script>

<template>
  <DataTable
    :data="systems"
    :columns="systemColumns"
    aria-label="Systems"
    min-width="58rem"
    :busy="isFetching"
    :dimmed="isPlaceholderData"
  />
</template>
