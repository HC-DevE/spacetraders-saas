<script setup lang="ts">
import { formatLabel, formatNumber } from '@/shared/utils/formatters'

import type { Ship } from '../../schemas/ship.schema'

defineProps<{
  crew: Ship['crew']
}>()
</script>

<template>
  <section class="flex min-w-0 flex-col border border-border bg-card text-card-foreground">
    <header class="border-b border-border px-5 py-4">
      <h2 class="text-base font-semibold">Crew</h2>

      <p class="mt-1 text-sm text-muted-foreground">Current staffing and operating conditions.</p>
    </header>

    <div class="flex flex-1 flex-col p-5">
      <p v-if="crew.current === 0 && crew.required === 0" class="text-sm text-muted-foreground">
        No crew is currently on board, and none is required.
      </p>

      <dl
        class="grid gap-px border border-border bg-border"
        :class="crew.current === 0 && crew.required === 0 ? 'mt-5' : ''"
      >
        <div class="grid grid-cols-2 gap-4 bg-card px-4 py-3">
          <dt class="text-xs text-muted-foreground">Shift rotation</dt>

          <dd class="text-right font-mono text-sm capitalize">
            {{ formatLabel(crew.rotation) }}
          </dd>
        </div>

        <div class="grid grid-cols-2 gap-4 bg-card px-4 py-3">
          <dt class="text-xs text-muted-foreground">Morale</dt>

          <dd class="text-right font-mono text-sm tabular-nums">
            {{ crew.current > 0 ? `${crew.morale}%` : 'Not applicable' }}
          </dd>
        </div>

        <div class="grid grid-cols-2 gap-4 bg-card px-4 py-3">
          <dt class="text-xs text-muted-foreground">Wages / crew / hour</dt>

          <dd class="text-right font-mono text-sm tabular-nums">
            {{ formatNumber(crew.wages) }} CR
          </dd>
        </div>
      </dl>
    </div>
  </section>
</template>
