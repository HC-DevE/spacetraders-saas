<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import AppButton from '@/shared/components/AppButton.vue'
import { formatDate, formatLabel, formatNumber } from '@/shared/utils/formatters'

import type { Ship } from '../schemas/ship.schema'
import { percentage } from '../utils/ship-formatters'
import { formatShipStatus } from '../utils/ship-status'

const props = defineProps<{
  ship: Ship
}>()

const router = useRouter()

const isInTransit = computed(() => props.ship.nav.status === 'IN_TRANSIT')

const status = computed(() => formatShipStatus(props.ship.nav.status))

const displayedLocation = computed(() =>
  isInTransit.value
    ? {
        systemSymbol: props.ship.nav.route.destination.systemSymbol,
        waypointSymbol: props.ship.nav.route.destination.symbol,
      }
    : {
        systemSymbol: props.ship.nav.systemSymbol,
        waypointSymbol: props.ship.nav.waypointSymbol,
      },
)

const fuelPercentage = computed(() => percentage(props.ship.fuel.current, props.ship.fuel.capacity))

const isLowFuel = computed(() => props.ship.fuel.capacity > 0 && fuelPercentage.value <= 20)

function viewDetails() {
  return router.push({
    name: routeNames.shipDetail,
    params: {
      symbol: props.ship.symbol,
    },
  })
}
</script>

<template>
  <article
    class="grid min-w-0 gap-5 bg-card px-4 py-4 text-card-foreground lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.35fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] lg:items-center lg:gap-4"
  >
    <!-- Ship -->
    <div class="min-w-0">
      <p class="truncate font-mono text-sm font-medium text-foreground" :title="ship.symbol">
        {{ ship.symbol }}
      </p>

      <p
        v-if="ship.registration.name && ship.registration.name !== ship.symbol"
        class="mt-1 truncate text-xs text-muted-foreground"
      >
        {{ ship.registration.name }}
      </p>
    </div>

    <!-- Role -->
    <div class="min-w-0">
      <p class="text-xs text-muted-foreground lg:hidden">Role</p>

      <p class="mt-1 text-sm capitalize lg:mt-0">
        {{ formatLabel(ship.registration.role) }}
      </p>

      <p class="mt-1 truncate text-xs text-muted-foreground">
        {{ ship.frame.name }}
      </p>
    </div>

    <!-- Status -->
    <div class="min-w-0">
      <p class="text-xs text-muted-foreground lg:hidden">Status</p>

      <div
        class="mt-1 flex items-center gap-2 text-sm font-medium lg:mt-0"
        :class="status.className"
      >
        <span class="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />

        <span>
          {{ status.label }}
        </span>
      </div>

      <p class="mt-1 text-xs text-muted-foreground">
        {{ formatLabel(ship.nav.flightMode) }}
      </p>
    </div>

    <!-- Location -->
    <div class="min-w-0">
      <p class="text-xs text-muted-foreground lg:hidden">
        {{ isInTransit ? 'Destination' : 'Location' }}
      </p>

      <RouterLink
        :to="{
          name: routeNames.waypointDetail,
          params: {
            systemSymbol: displayedLocation.systemSymbol,
            waypointSymbol: displayedLocation.waypointSymbol,
          },
        }"
        :aria-label="`Open waypoint ${displayedLocation.waypointSymbol}`"
        class="mt-1 block truncate rounded-sm font-mono text-sm text-foreground underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:mt-0"
        :title="displayedLocation.waypointSymbol"
      >
        {{ displayedLocation.waypointSymbol }}
      </RouterLink>

      <RouterLink
        :to="{
          name: routeNames.systemDetail,
          params: {
            systemSymbol: displayedLocation.systemSymbol,
          },
        }"
        :aria-label="`Open system ${displayedLocation.systemSymbol}`"
        class="mt-1 block truncate rounded-sm font-mono text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {{ displayedLocation.systemSymbol }}
      </RouterLink>

      <p v-if="isInTransit" class="mt-1 text-xs text-muted-foreground">
        Expected arrival
        <time class="font-mono" :datetime="ship.nav.route.arrival">
          {{ formatDate(ship.nav.route.arrival) }}
        </time>
      </p>
    </div>

    <!-- Fuel -->
    <div class="min-w-0">
      <p class="text-xs text-muted-foreground lg:hidden">Fuel</p>

      <template v-if="ship.fuel.capacity > 0">
        <p
          class="mt-1 font-mono text-sm tabular-nums lg:mt-0"
          :class="isLowFuel ? 'text-alert' : 'text-foreground'"
        >
          {{ formatNumber(ship.fuel.current) }}
          <span class="text-muted-foreground"> /{{ formatNumber(ship.fuel.capacity) }} </span>
        </p>

        <div aria-hidden="true" class="mt-2 h-px bg-muted">
          <div
            class="h-px"
            :class="isLowFuel ? 'bg-alert' : 'bg-signal'"
            :style="{
              width: `${fuelPercentage}%`,
            }"
          />
        </div>

        <p v-if="ship.fuel.current === 0" class="mt-1 text-xs text-alert">Fuel tank is empty.</p>
      </template>

      <p v-else class="mt-1 text-xs text-muted-foreground lg:mt-0">No fuel capacity</p>
    </div>

    <!-- Cargo -->
    <div class="min-w-0">
      <p class="text-xs text-muted-foreground lg:hidden">Cargo</p>

      <template v-if="ship.cargo.capacity > 0">
        <p class="mt-1 font-mono text-sm tabular-nums lg:mt-0">
          {{ formatNumber(ship.cargo.units) }}
          <span class="text-muted-foreground"> /{{ formatNumber(ship.cargo.capacity) }} </span>
        </p>

        <div aria-hidden="true" class="mt-2 h-px bg-muted">
          <div
            class="h-px bg-orbit"
            :style="{
              width: `${percentage(ship.cargo.units, ship.cargo.capacity)}%`,
            }"
          />
        </div>
      </template>

      <p v-else class="mt-1 text-xs text-muted-foreground lg:mt-0">No cargo capacity</p>
    </div>

    <!-- Action -->
    <div class="flex lg:justify-end">
      <AppButton
        type="button"
        variant="outline"
        size="sm"
        :aria-label="`View ship ${ship.symbol}`"
        class="h-8 shrink-0 px-3 text-xs"
        @click="viewDetails"
      >
        Details
      </AppButton>
    </div>
  </article>
</template>
