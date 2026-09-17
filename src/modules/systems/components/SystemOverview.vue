<script setup lang="ts">
import { formatLabel } from '@/shared/utils/formatters'

import type { System } from '../schemas/system.schema'

defineProps<{
  system: System
}>()
</script>

<template>
  <section aria-labelledby="system-overview-title" class="min-w-0 space-y-3">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id="system-overview-title" class="text-base font-semibold">System overview</h2>

        <p class="mt-1 text-sm text-muted-foreground">
          Galactic position and known system information.
        </p>
      </div>

      <p class="font-mono text-sm capitalize text-orbit">
        {{ formatLabel(system.type) }}
      </p>
    </header>

    <dl
      class="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
    >
      <div class="min-w-0 bg-card p-5">
        <dt class="text-xs text-muted-foreground">Sector</dt>

        <dd class="mt-3 truncate font-mono text-lg font-medium" :title="system.sectorSymbol">
          {{ system.sectorSymbol }}
        </dd>
      </div>

      <div class="min-w-0 bg-card p-5">
        <dt class="text-xs text-muted-foreground">Constellation</dt>

        <dd
          class="mt-3 truncate font-mono text-lg font-medium"
          :title="system.constellation || undefined"
        >
          {{ system.constellation || 'Not provided' }}
        </dd>
      </div>

      <div class="bg-card p-5">
        <dt class="text-xs text-muted-foreground">Coordinates</dt>

        <dd class="mt-3 font-mono text-lg font-medium tabular-nums">
          {{ system.x }},
          {{ system.y }}
        </dd>
      </div>

      <div class="bg-card p-5">
        <dt class="text-xs text-muted-foreground">Known waypoints</dt>

        <dd class="mt-3 font-mono text-2xl font-medium tabular-nums">
          {{ system.waypoints.length }}
        </dd>
      </div>
    </dl>

    <div
      class="flex flex-wrap items-start gap-x-4 gap-y-2 border-x border-b border-border bg-background px-4 py-3"
    >
      <p class="text-xs text-muted-foreground">Factions</p>

      <ul v-if="system.factions.length" class="flex flex-wrap gap-x-4 gap-y-1">
        <li
          v-for="faction in system.factions"
          :key="faction.symbol"
          class="font-mono text-xs text-foreground"
        >
          {{ formatLabel(faction.symbol) }}
        </li>
      </ul>

      <p v-else class="text-xs text-muted-foreground">No faction presence reported.</p>
    </div>
  </section>
</template>
