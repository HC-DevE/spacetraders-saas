<script setup lang="ts">
import { formatLabel } from '@/shared/utils/formatters'
import type { System } from '../schemas/system.schema'

defineProps<{
  system: System
}>()
</script>

<template>
  <section
    aria-labelledby="system-overview-title"
    class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 id="system-overview-title" class="text-lg font-semibold">System overview</h2>

        <p class="mt-1 text-sm text-muted-foreground">
          Galactic position and known system information.
        </p>
      </div>

      <span
        class="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize text-secondary-foreground"
      >
        {{ formatLabel(system.type) }}
      </span>
    </div>

    <dl class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg bg-muted p-4">
        <dt class="text-xs font-medium text-muted-foreground">Sector</dt>

        <dd class="mt-1 font-semibold">
          {{ system.sectorSymbol }}
        </dd>
      </div>

      <div class="rounded-lg bg-muted p-4">
        <dt class="text-xs font-medium text-muted-foreground">Constellation</dt>

        <dd class="mt-1 font-semibold">
          {{ system.constellation || 'Not provided' }}
        </dd>
      </div>

      <div class="rounded-lg bg-muted p-4">
        <dt class="text-xs font-medium text-muted-foreground">Coordinates</dt>

        <dd class="mt-1 font-semibold tabular-nums">{{ system.x }}, {{ system.y }}</dd>
      </div>

      <div class="rounded-lg bg-muted p-4">
        <dt class="text-xs font-medium text-muted-foreground">Known waypoints</dt>

        <dd class="mt-1 font-semibold tabular-nums">
          {{ system.waypoints.length }}
        </dd>
      </div>
    </dl>

    <div class="mt-5 border-t pt-4">
      <h3 class="text-sm font-medium">Factions</h3>

      <ul v-if="system.factions.length" class="mt-3 flex flex-wrap gap-2">
        <li
          v-for="faction in system.factions"
          :key="faction.symbol"
          class="rounded-full border bg-muted px-3 py-1 text-xs font-medium capitalize"
        >
          {{ formatLabel(faction.symbol) }}
        </li>
      </ul>

      <p v-else class="mt-2 text-sm text-muted-foreground">No faction presence reported.</p>
    </div>
  </section>
</template>
