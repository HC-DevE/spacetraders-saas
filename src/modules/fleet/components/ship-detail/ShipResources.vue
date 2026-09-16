<script setup lang="ts">
import { formatDate, formatNumber } from '@/shared/utils/formatters'
import type { Ship } from '../../schemas/ship.schema'
import { percentage } from '../../utils/ship-formatters'

defineProps<{
  fuel: Ship['fuel']
  cargo: Ship['cargo']
  crew: Ship['crew']
}>()
</script>

<template>
  <div class="min-w-0 space-y-4 wrap-anywhere">
    <section aria-label="Ship resources" class="grid gap-4 md:grid-cols-3">
      <article
        class="flex min-w-0 flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
      >
        <h2 class="text-sm font-medium text-muted-foreground">Fuel</h2>

        <template v-if="fuel.capacity > 0">
          <p class="mt-3">
            <span class="text-2xl font-semibold tabular-nums">
              {{ formatNumber(fuel.current) }}
            </span>
            <span class="text-sm text-muted-foreground"> / {{ formatNumber(fuel.capacity) }} </span>
          </p>

          <div aria-hidden="true" class="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-primary"
              :style="{ width: `${percentage(fuel.current, fuel.capacity)}%` }"
            />
          </div>
        </template>

        <p v-else class="mt-3 text-lg font-semibold">No fuel tank</p>

        <p class="mt-3 text-sm text-muted-foreground">Fuel currently available</p>

        <p
          v-if="fuel.capacity > 0 && fuel.current === 0"
          class="mt-3 rounded-lg bg-warning-subtle p-3 text-sm text-warning"
        >
          Fuel tank is empty.
        </p>
      </article>

      <article
        class="flex min-w-0 flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
      >
        <h2 class="text-sm font-medium text-muted-foreground">Cargo</h2>

        <template v-if="cargo.capacity > 0">
          <p class="mt-3">
            <span class="text-2xl font-semibold tabular-nums">
              {{ formatNumber(cargo.units) }}
            </span>
            <span class="text-sm text-muted-foreground">
              / {{ formatNumber(cargo.capacity) }}
            </span>
          </p>

          <div aria-hidden="true" class="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-primary"
              :style="{ width: `${percentage(cargo.units, cargo.capacity)}%` }"
            />
          </div>
        </template>

        <p v-else class="mt-3 text-lg font-semibold">No cargo hold</p>

        <p class="mt-3 text-sm text-muted-foreground">Occupied cargo capacity</p>
      </article>

      <article
        class="flex min-w-0 flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
      >
        <h2 class="text-sm font-medium text-muted-foreground">Crew</h2>

        <template v-if="crew.capacity > 0">
          <p class="mt-3">
            <span class="text-2xl font-semibold tabular-nums">
              {{ formatNumber(crew.current) }}
            </span>
            <span class="text-sm text-muted-foreground"> / {{ formatNumber(crew.capacity) }} </span>
          </p>

          <div aria-hidden="true" class="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-primary"
              :style="{ width: `${percentage(crew.current, crew.capacity)}%` }"
            />
          </div>
        </template>

        <p v-else class="mt-3 text-lg font-semibold">No crew capacity</p>

        <p class="mt-3 text-sm text-muted-foreground">
          {{ formatNumber(crew.required) }} crew required
        </p>

        <p
          v-if="crew.current < crew.required"
          class="mt-3 rounded-lg bg-warning-subtle p-3 text-sm text-warning"
        >
          Crew is below the required minimum.
        </p>
      </article>
    </section>

    <div
      v-if="fuel.consumed"
      class="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-lg bg-muted px-4 py-3 text-sm"
    >
      <p class="text-muted-foreground">Last recorded fuel consumption:</p>

      <p class="font-medium">{{ formatNumber(fuel.consumed.amount) }} units</p>

      <time :datetime="fuel.consumed.timestamp" class="text-muted-foreground">
        {{ formatDate(fuel.consumed.timestamp) }}
      </time>
    </div>
  </div>
</template>
