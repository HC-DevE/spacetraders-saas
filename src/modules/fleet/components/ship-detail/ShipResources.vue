<script setup lang="ts">
import { computed } from 'vue'

import { formatDate, formatNumber } from '@/shared/utils/formatters'

import type { Ship } from '../../schemas/ship.schema'
import { percentage } from '../../utils/ship-formatters'

const props = defineProps<{
  fuel: Ship['fuel']
  cargo: Ship['cargo']
  crew: Ship['crew']
}>()

const fuelPercentage = computed(() => percentage(props.fuel.current, props.fuel.capacity))

const cargoPercentage = computed(() => percentage(props.cargo.units, props.cargo.capacity))

const crewPercentage = computed(() => percentage(props.crew.current, props.crew.capacity))
</script>

<template>
  <section aria-label="Ship resources" class="min-w-0">
    <header class="mb-3">
      <h2 class="text-base font-semibold">Resources</h2>

      <p class="mt-1 text-sm text-muted-foreground">Current operational capacity.</p>
    </header>

    <div class="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
      <!-- Fuel -->
      <article class="bg-card p-5">
        <p class="text-xs text-muted-foreground">Fuel</p>

        <template v-if="fuel.capacity > 0">
          <p class="mt-3 font-mono">
            <span
              class="text-2xl font-medium tabular-nums"
              :class="fuel.current === 0 ? 'text-alert' : 'text-foreground'"
            >
              {{ formatNumber(fuel.current) }}
            </span>

            <span class="text-sm text-muted-foreground"> /{{ formatNumber(fuel.capacity) }} </span>
          </p>

          <div aria-hidden="true" class="mt-4 h-px bg-muted">
            <div
              class="h-px"
              :class="fuel.current === 0 ? 'bg-alert' : 'bg-signal'"
              :style="{
                width: `${fuelPercentage}%`,
              }"
            />
          </div>
        </template>

        <p v-else class="mt-3 text-lg font-medium">No fuel tank</p>

        <p class="mt-3 text-xs text-muted-foreground">Fuel currently available</p>

        <p
          v-if="fuel.capacity > 0 && fuel.current === 0"
          class="mt-3 text-xs font-medium text-alert"
        >
          Fuel tank is empty.
        </p>
      </article>

      <!-- Cargo -->
      <article class="bg-card p-5">
        <p class="text-xs text-muted-foreground">Cargo</p>

        <template v-if="cargo.capacity > 0">
          <p class="mt-3 font-mono">
            <span class="text-2xl font-medium tabular-nums">
              {{ formatNumber(cargo.units) }}
            </span>

            <span class="text-sm text-muted-foreground"> /{{ formatNumber(cargo.capacity) }} </span>
          </p>

          <div aria-hidden="true" class="mt-4 h-px bg-muted">
            <div
              class="h-px bg-orbit"
              :style="{
                width: `${cargoPercentage}%`,
              }"
            />
          </div>
        </template>

        <p v-else class="mt-3 text-lg font-medium">No cargo hold</p>

        <p class="mt-3 text-xs text-muted-foreground">Occupied cargo capacity</p>
      </article>

      <!-- Crew -->
      <article class="bg-card p-5">
        <p class="text-xs text-muted-foreground">Crew</p>

        <template v-if="crew.capacity > 0">
          <p class="mt-3 font-mono">
            <span
              class="text-2xl font-medium tabular-nums"
              :class="crew.current < crew.required ? 'text-alert' : 'text-foreground'"
            >
              {{ formatNumber(crew.current) }}
            </span>

            <span class="text-sm text-muted-foreground"> /{{ formatNumber(crew.capacity) }} </span>
          </p>

          <div aria-hidden="true" class="mt-4 h-px bg-muted">
            <div
              class="h-px"
              :class="crew.current < crew.required ? 'bg-alert' : 'bg-orbit'"
              :style="{
                width: `${crewPercentage}%`,
              }"
            />
          </div>
        </template>

        <p v-else class="mt-3 text-lg font-medium">No crew capacity</p>

        <p class="mt-3 text-xs text-muted-foreground">
          <span class="font-mono">
            {{ formatNumber(crew.required) }}
          </span>
          crew required
        </p>

        <p v-if="crew.current < crew.required" class="mt-3 text-xs font-medium text-alert">
          Crew is below the required minimum.
        </p>
      </article>
    </div>

    <div
      v-if="fuel.consumed"
      class="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-x border-b border-border bg-background px-4 py-3 text-xs"
    >
      <span class="text-muted-foreground"> Last fuel consumption </span>

      <span class="font-mono text-foreground">
        {{ formatNumber(fuel.consumed.amount) }}
        units
      </span>

      <time :datetime="fuel.consumed.timestamp" class="font-mono text-muted-foreground">
        {{ formatDate(fuel.consumed.timestamp) }}
      </time>
    </div>
  </section>
</template>
