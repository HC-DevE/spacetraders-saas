<script setup lang="ts">
import { useRouter } from 'vue-router'

import AppButton from '@/shared/components/AppButton.vue'

import type { System } from '../schemas/system.schema'
import { formatLabel } from '@/shared/utils/formatters'

const props = defineProps<{
  system: System
}>()

const router = useRouter()

function viewDetails() {
  return router.push({
    name: 'system-detail',
    params: {
      systemSymbol: props.system.symbol,
    },
  })
}
</script>

<template>
  <article
    class="flex min-w-0 flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-sm wrap-anywhere"
  >
    <header class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <div class="min-w-0">
        <h2 class="text-lg font-semibold leading-snug">
          {{ system.name || system.symbol }}
        </h2>

        <p v-if="system.name" class="mt-1 text-xs text-muted-foreground">
          {{ system.symbol }}
        </p>

        <p class="mt-2 text-sm text-muted-foreground">
          Sector
          <span class="font-medium text-foreground">
            {{ system.sectorSymbol }}
          </span>
        </p>
      </div>

      <AppButton
        type="button"
        variant="secondary"
        size="sm"
        :aria-label="`View system ${system.symbol}`"
        class="shrink-0"
        @click="viewDetails"
      >
        View details
      </AppButton>
    </header>

    <div class="mt-4 flex flex-wrap items-center gap-2">
      <span
        class="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold capitalize text-secondary-foreground"
      >
        {{ formatLabel(system.type) }}
      </span>

      <p v-if="system.constellation" class="text-xs text-muted-foreground">
        {{ system.constellation }}
      </p>
    </div>

    <dl class="mt-5 grid gap-3 sm:grid-cols-2">
      <div class="rounded-lg bg-muted p-4">
        <dt class="text-xs font-medium text-muted-foreground">Coordinates</dt>

        <dd class="mt-2 font-semibold tabular-nums">{{ system.x }}, {{ system.y }}</dd>
      </div>

      <div class="rounded-lg bg-muted p-4">
        <dt class="text-xs font-medium text-muted-foreground">Waypoints</dt>

        <dd class="mt-2 text-lg font-semibold tabular-nums">
          {{ system.waypoints.length }}
        </dd>
      </div>
    </dl>

    <div v-if="system.factions.length" class="mt-5 border-t pt-4">
      <p class="text-sm font-medium">Factions</p>

      <ul class="mt-3 flex flex-wrap gap-2">
        <li
          v-for="faction in system.factions"
          :key="faction.symbol"
          class="rounded-full border bg-muted px-3 py-1 text-xs font-medium capitalize"
        >
          {{ formatLabel(faction.symbol) }}
        </li>
      </ul>
    </div>
  </article>
</template>
