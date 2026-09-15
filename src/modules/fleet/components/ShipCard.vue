<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from '@/shared/components/AppButton.vue'

import type { Ship } from '../schemas/ship.schema'
import { formatDate, formatLabel, formatNumber, percentage } from '../utils/ship-formatters'
import { formatShipStatus } from '../utils/ship-status'

const props = defineProps<{ ship: Ship }>()
const router = useRouter()

const isInTransit = computed(() => props.ship.nav.status === 'IN_TRANSIT')
const status = computed(() => formatShipStatus(props.ship.nav.status))

function viewDetails() {
  return router.push({
    name: 'ship-detail',
    params: { symbol: props.ship.symbol },
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
          {{ ship.registration.name || ship.symbol }}
        </h2>

        <p v-if="ship.registration.name !== ship.symbol" class="mt-1 text-xs text-muted-foreground">
          {{ ship.symbol }}
        </p>

        <p class="mt-2 text-sm text-muted-foreground">
          <span class="capitalize">
            {{ formatLabel(ship.registration.role) }}
          </span>

          <span aria-hidden="true"> · </span>

          {{ ship.frame.name }}
        </p>
      </div>

      <AppButton
        type="button"
        variant="secondary"
        size="sm"
        :aria-label="`View ship ${ship.symbol}`"
        class="shrink-0"
        @click="viewDetails"
      >
        View details
      </AppButton>
    </header>

    <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="status.className">
        {{ status.label }}
      </span>

      <p class="text-xs text-muted-foreground">
        Flight mode:
        <span class="font-medium capitalize text-foreground">
          {{ formatLabel(ship.nav.flightMode) }}
        </span>
      </p>
    </div>

    <section class="mt-5 rounded-lg border bg-background p-4">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {{ isInTransit ? 'Destination' : 'Location' }}
      </h3>

      <dl class="mt-3 grid gap-4 sm:grid-cols-2">
        <div class="min-w-0">
          <dt class="text-xs text-muted-foreground">System</dt>
          <dd class="mt-1 text-sm font-medium">
            {{ isInTransit ? ship.nav.route.destination.systemSymbol : ship.nav.systemSymbol }}
          </dd>
        </div>

        <div class="min-w-0">
          <dt class="text-xs text-muted-foreground">Waypoint</dt>
          <dd class="mt-1 text-sm font-medium">
            {{ isInTransit ? ship.nav.route.destination.symbol : ship.nav.waypointSymbol }}
          </dd>
        </div>
      </dl>

      <div v-if="isInTransit" class="mt-4 border-t pt-3">
        <p class="text-xs text-muted-foreground">Expected arrival</p>
        <p class="mt-1 text-sm font-medium">
          <time :datetime="ship.nav.route.arrival">
            {{ formatDate(ship.nav.route.arrival) }}
          </time>
        </p>
      </div>
    </section>

    <div class="mt-5 grid flex-1 gap-3 sm:grid-cols-2">
      <section class="flex min-w-0 flex-col rounded-lg bg-muted p-4">
        <h3 class="text-sm font-semibold">Fuel</h3>

        <p class="mt-2 text-lg font-semibold tabular-nums">
          <template v-if="ship.fuel.capacity > 0">
            {{ formatNumber(ship.fuel.current) }}
            <span class="text-sm font-normal text-muted-foreground">
              / {{ formatNumber(ship.fuel.capacity) }}
            </span>
          </template>
          <span v-else aria-hidden="true" class="text-muted-foreground">—</span>
        </p>

        <p class="mt-1 text-xs text-muted-foreground">
          {{ ship.fuel.capacity > 0 ? 'Available / capacity' : 'No fuel capacity' }}
        </p>

        <div class="mt-auto pt-3">
          <div
            aria-hidden="true"
            class="h-2 overflow-hidden rounded-full bg-background"
            :class="{ invisible: ship.fuel.capacity === 0 }"
          >
            <div
              class="h-full rounded-full bg-primary"
              :style="{ width: `${percentage(ship.fuel.current, ship.fuel.capacity)}%` }"
            />
          </div>
        </div>

        <p
          v-if="ship.fuel.capacity > 0 && ship.fuel.current === 0"
          class="mt-2 text-xs font-medium text-destructive"
        >
          Fuel tank is empty
        </p>
      </section>

      <section class="flex min-w-0 flex-col rounded-lg bg-muted p-4">
        <h3 class="text-sm font-semibold">Cargo</h3>

        <p class="mt-2 text-lg font-semibold tabular-nums">
          <template v-if="ship.cargo.capacity > 0">
            {{ formatNumber(ship.cargo.units) }}
            <span class="text-sm font-normal text-muted-foreground">
              / {{ formatNumber(ship.cargo.capacity) }}
            </span>
          </template>
          <span v-else aria-hidden="true" class="text-muted-foreground">—</span>
        </p>

        <p class="mt-1 text-xs text-muted-foreground">
          {{ ship.cargo.capacity > 0 ? 'Used / capacity' : 'No cargo capacity' }}
        </p>

        <div class="mt-auto pt-3">
          <div
            aria-hidden="true"
            class="h-2 overflow-hidden rounded-full bg-background"
            :class="{ invisible: ship.cargo.capacity === 0 }"
          >
            <div
              class="h-full rounded-full bg-primary"
              :style="{ width: `${percentage(ship.cargo.units, ship.cargo.capacity)}%` }"
            />
          </div>
        </div>
      </section>
    </div>
  </article>
</template>
