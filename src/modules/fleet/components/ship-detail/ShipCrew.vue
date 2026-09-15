<script setup lang="ts">
import type { Ship } from '../../schemas/ship.schema'
import { formatLabel, formatNumber } from '../../utils/ship-formatters'

defineProps<{ crew: Ship['crew'] }>()
</script>

<template>
  <section
    class="flex min-w-0 flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
  >
    <h2 class="text-lg font-semibold">Crew</h2>

    <p v-if="crew.current === 0 && crew.required === 0" class="mt-4 text-sm text-muted-foreground">
      No crew is currently on board, and none is required.
    </p>

    <dl class="mt-5 grid grid-cols-2 gap-5 text-sm">
      <div class="min-w-0">
        <dt class="text-muted-foreground">Shift rotation</dt>
        <dd class="mt-1 font-medium capitalize">
          {{ formatLabel(crew.rotation) }}
        </dd>
      </div>

      <div class="min-w-0">
        <dt class="text-muted-foreground">Morale</dt>
        <dd class="mt-1 font-medium">
          {{ crew.current > 0 ? `${crew.morale}%` : 'Not applicable' }}
        </dd>
      </div>

      <div class="col-span-2 min-w-0">
        <dt class="text-muted-foreground">Wages per crew member</dt>
        <dd class="mt-1 font-medium">{{ formatNumber(crew.wages) }} credits / hour</dd>
      </div>
    </dl>
  </section>
</template>
