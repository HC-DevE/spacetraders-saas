<script setup lang="ts">
import { useRouter } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import AppButton from '@/shared/components/AppButton.vue'
import { formatLabel } from '@/shared/utils/formatters'

import type { System } from '../schemas/system.schema'

const props = defineProps<{
  system: System
}>()

const router = useRouter()

function viewDetails() {
  return router.push({
    name: routeNames.systemDetail,
    params: {
      systemSymbol: props.system.symbol,
    },
  })
}
</script>

<template>
  <article
    class="grid min-w-0 gap-5 bg-card px-4 py-4 text-card-foreground lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,0.85fr)_minmax(0,0.7fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-4"
  >
    <!-- System -->
    <div class="min-w-0">
      <p class="truncate font-mono text-sm font-medium text-foreground" :title="system.symbol">
        {{ system.symbol }}
      </p>

      <p
        v-if="system.name"
        class="mt-1 truncate text-xs text-muted-foreground"
        :title="system.name"
      >
        {{ system.name }}
      </p>
    </div>

    <!-- Type -->
    <div class="min-w-0">
      <p class="text-xs text-muted-foreground lg:hidden">Type</p>

      <p class="mt-1 text-sm capitalize text-orbit lg:mt-0">
        {{ formatLabel(system.type) }}
      </p>
    </div>

    <!-- Sector -->
    <div class="min-w-0">
      <p class="text-xs text-muted-foreground lg:hidden">Sector</p>

      <p class="mt-1 truncate font-mono text-sm lg:mt-0" :title="system.sectorSymbol">
        {{ system.sectorSymbol }}
      </p>

      <p
        v-if="system.constellation"
        class="mt-1 truncate text-xs text-muted-foreground"
        :title="system.constellation"
      >
        {{ system.constellation }}
      </p>
    </div>

    <!-- Coordinates -->
    <div class="min-w-0">
      <p class="text-xs text-muted-foreground lg:hidden">Coordinates</p>

      <p class="mt-1 font-mono text-sm tabular-nums lg:mt-0">
        {{ system.x }},
        {{ system.y }}
      </p>
    </div>

    <!-- Waypoints -->
    <div class="min-w-0">
      <p class="text-xs text-muted-foreground lg:hidden">Waypoints</p>

      <p class="mt-1 font-mono text-sm tabular-nums lg:mt-0">
        {{ system.waypoints.length }}
      </p>
    </div>

    <!-- Factions -->
    <div class="min-w-0">
      <p class="text-xs text-muted-foreground lg:hidden">Factions</p>

      <ul v-if="system.factions.length" class="mt-1 flex flex-wrap gap-x-2 gap-y-1 lg:mt-0">
        <li
          v-for="faction in system.factions"
          :key="faction.symbol"
          class="font-mono text-xs text-muted-foreground"
        >
          {{ formatLabel(faction.symbol) }}
        </li>
      </ul>

      <p v-else class="mt-1 text-xs text-muted-foreground lg:mt-0">None</p>
    </div>

    <!-- Action -->
    <div class="flex lg:justify-end">
      <AppButton
        type="button"
        variant="outline"
        size="sm"
        :aria-label="`View system ${system.symbol}`"
        class="h-8 shrink-0 px-3 text-xs"
        @click="viewDetails"
      >
        Details
      </AppButton>
    </div>
  </article>
</template>
