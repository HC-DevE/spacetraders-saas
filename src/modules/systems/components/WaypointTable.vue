<script setup lang="ts">
import DataTable from '@/shared/components/table/DataTable.vue'

import type { Waypoint } from '../schemas/waypoint.schema'
import { waypointColumns } from './waypoint-table.columns'

defineProps<{
  waypoints: Waypoint[]
  isFetching: boolean
  isPlaceholderData: boolean
}>()
</script>

<template>
  <DataTable
    :data="waypoints"
    :columns="waypointColumns"
    aria-label="Waypoints"
    min-width="68rem"
    :busy="isFetching"
    :dimmed="isPlaceholderData"
  />
</template>
