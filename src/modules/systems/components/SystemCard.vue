<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import { formatLabel } from '@/shared/utils/formatters'

import type { System } from '../schemas/system.schema'

const props = defineProps<{
  system: System
}>()

const waypointTypeCounts = computed(() => {
  const counts = new Map<string, number>()

  for (const waypoint of props.system.waypoints) {
    counts.set(waypoint.type, (counts.get(waypoint.type) ?? 0) + 1)
  }

  return Array.from(counts.entries()).map(([type, count]) => ({
    type,
    label: formatLabel(type),
    count,
  }))
})

const visibleWaypointTypes = computed(() => waypointTypeCounts.value.slice(0, 4))

const hiddenWaypointTypeCount = computed(() =>
  Math.max(0, waypointTypeCounts.value.length - visibleWaypointTypes.value.length),
)

const factionLabel = computed(() => {
  if (!props.system.factions.length) {
    return null
  }

  return props.system.factions.map((faction) => formatLabel(faction.symbol)).join(', ')
})
</script>

<template>
  <RouterLink
    :to="{
      name: routeNames.systemDetail,
      params: {
        systemSymbol: system.symbol,
      },
    }"
    :aria-label="`Open system ${system.symbol}`"
    class="group/system block h-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <article
      class="flex h-full min-w-0 flex-col border border-border bg-card text-card-foreground transition-colors group-hover/system:border-signal/50"
    >
      <!-- Identity -->
      <header class="p-5">
        <div class="flex items-start justify-between gap-4">
          <span
            class="shrink-0 border border-orbit/30 px-2 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-orbit"
          >
            {{ formatLabel(system.type) }}
          </span>

          <span
            class="min-w-0 truncate font-mono text-xs text-muted-foreground"
            :title="system.symbol"
          >
            {{ system.symbol }}
          </span>
        </div>

        <h2
          class="mt-5 truncate text-lg font-semibold tracking-tight text-foreground"
          :title="system.name || system.symbol"
        >
          {{ system.name || system.symbol }}
        </h2>

        <p
          class="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"
        >
          <span v-if="system.constellation" class="truncate" :title="system.constellation">
            {{ system.constellation }}
          </span>

          <span v-else> Constellation not reported </span>

          <span class="text-border" aria-hidden="true"> · </span>

          <span>
            Sector
            <span class="font-mono text-foreground">
              {{ system.sectorSymbol }}
            </span>
          </span>
        </p>
      </header>

      <!-- Exploration summary -->
      <section class="border-t border-border px-5 py-4">
        <div class="flex items-baseline justify-between gap-4">
          <h3
            class="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground"
          >
            Known waypoints
          </h3>

          <span class="font-mono text-lg font-medium tabular-nums text-foreground">
            {{ system.waypoints.length }}
          </span>
        </div>

        <div v-if="visibleWaypointTypes.length" class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="waypointType in visibleWaypointTypes"
            :key="waypointType.type"
            class="inline-flex items-center gap-2 border border-border bg-background px-2.5 py-1.5 text-xs"
          >
            <span class="text-muted-foreground">
              {{ waypointType.label }}
            </span>

            <span class="font-mono tabular-nums text-foreground"> ×{{ waypointType.count }} </span>
          </span>

          <span
            v-if="hiddenWaypointTypeCount"
            class="inline-flex items-center border border-border px-2.5 py-1.5 font-mono text-xs text-muted-foreground"
          >
            +{{ hiddenWaypointTypeCount }}
            {{ hiddenWaypointTypeCount === 1 ? 'type' : 'types' }}
          </span>
        </div>

        <p v-else class="mt-3 text-sm text-muted-foreground">No known waypoints.</p>
      </section>

      <!-- Context -->
      <dl class="mt-auto grid border-t border-border sm:grid-cols-2">
        <div class="min-w-0 border-b border-border p-4 sm:border-b-0 sm:border-r">
          <dt
            class="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
          >
            {{ system.factions.length === 1 ? 'Faction' : 'Factions' }}
          </dt>

          <dd
            v-if="factionLabel"
            class="mt-2 truncate font-mono text-sm font-medium text-foreground"
            :title="factionLabel"
          >
            {{ factionLabel }}
          </dd>

          <dd v-else class="mt-2 text-sm text-muted-foreground">None reported</dd>
        </div>

        <div class="min-w-0 p-4">
          <dt
            class="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground"
          >
            Coordinates
          </dt>

          <dd class="mt-2 font-mono text-sm font-medium tabular-nums text-foreground">
            {{ system.x }}, {{ system.y }}
          </dd>
        </div>
      </dl>

      <!-- Action hint -->
      <footer
        class="flex items-center justify-end gap-2 border-t border-border px-5 py-3 text-sm font-medium text-muted-foreground transition-colors group-hover/system:text-signal"
        aria-hidden="true"
      >
        Explore system

        <ArrowRight class="size-4 transition-transform group-hover/system:translate-x-1" />
      </footer>
    </article>
  </RouterLink>
</template>
