<script setup lang="ts">
import { Eye } from '@lucide/vue'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import { formatDate, formatLabel, formatNumber } from '@/shared/utils/formatters'

import type { Ship } from '../schemas/ship.schema'
import { percentage } from '../utils/ship-formatters'
import { formatShipStatus } from '../utils/ship-status'

const props = defineProps<{
  ship: Ship
}>()

const isInTransit = computed(() => props.ship.nav.status === 'IN_TRANSIT')

const status = computed(() => formatShipStatus(props.ship.nav.status))

const displayedLocation = computed(() => {
  if (isInTransit.value) {
    return {
      systemSymbol: props.ship.nav.route.destination.systemSymbol,
      waypointSymbol: props.ship.nav.route.destination.symbol,
    }
  }

  return {
    systemSymbol: props.ship.nav.systemSymbol,
    waypointSymbol: props.ship.nav.waypointSymbol,
  }
})

const fuelPercentage = computed(() => percentage(props.ship.fuel.current, props.ship.fuel.capacity))

const cargoPercentage = computed(() =>
  percentage(props.ship.cargo.units, props.ship.cargo.capacity),
)

const isLowFuel = computed(() => props.ship.fuel.capacity > 0 && fuelPercentage.value <= 20)
</script>

<template>
  <article class="flex min-w-0 flex-col border border-border bg-card text-card-foreground">
    <header class="flex flex-wrap items-start justify-between gap-4 p-5">
      <div class="min-w-0">
        <RouterLink
          :to="{
            name: routeNames.shipDetail,
            params: {
              symbol: ship.symbol,
            },
          }"
          :aria-label="`Open ship ${ship.symbol}`"
          class="group/ship inline-flex max-w-full items-center gap-2 rounded-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span class="truncate" :title="ship.registration.name || ship.symbol">
            {{ ship.registration.name || ship.symbol }}
          </span>

          <Eye
            class="size-4 shrink-0 text-muted-foreground transition-colors group-hover/ship:text-signal"
            aria-hidden="true"
          />
        </RouterLink>

        <p
          v-if="ship.registration.name !== ship.symbol"
          class="mt-1 truncate font-mono text-xs text-muted-foreground"
          :title="ship.symbol"
        >
          {{ ship.symbol }}
        </p>

        <p class="mt-2 text-sm text-muted-foreground">
          {{ formatLabel(ship.registration.role) }}
          <span aria-hidden="true"> · </span>
          {{ ship.frame.name }}
        </p>

        <p
          class="mt-1 truncate font-mono text-xs text-muted-foreground"
          :title="ship.registration.factionSymbol"
        >
          {{ ship.registration.factionSymbol }}
        </p>
      </div>

      <div class="shrink-0 text-right">
        <p class="inline-flex items-center gap-2 text-sm font-medium" :class="status.className">
          <span class="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />

          {{ status.label }}
        </p>

        <p class="mt-1 text-xs text-muted-foreground">
          {{ formatLabel(ship.nav.flightMode) }}
        </p>
      </div>
    </header>

    <dl class="grid flex-1 border-t border-border sm:grid-cols-2 sm:grid-rows-[auto_1fr]">
      <div class="min-w-0 border-b border-border bg-card p-4 sm:col-span-2">
        <dt class="text-xs font-medium text-muted-foreground">
          {{ isInTransit ? 'Destination' : 'Location' }}
        </dt>

        <dd class="mt-2 min-w-0">
          <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <RouterLink
              :to="{
                name: routeNames.systemDetail,
                params: {
                  systemSymbol: displayedLocation.systemSymbol,
                },
              }"
              :aria-label="`Open system ${displayedLocation.systemSymbol}`"
              class="truncate rounded-sm font-mono text-sm text-foreground underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ displayedLocation.systemSymbol }}
            </RouterLink>

            <span class="text-muted-foreground" aria-hidden="true"> → </span>

            <RouterLink
              :to="{
                name: routeNames.waypointDetail,
                params: {
                  systemSymbol: displayedLocation.systemSymbol,
                  waypointSymbol: displayedLocation.waypointSymbol,
                },
              }"
              :aria-label="`Open waypoint ${displayedLocation.waypointSymbol}`"
              class="truncate rounded-sm font-mono text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ displayedLocation.waypointSymbol }}
            </RouterLink>
          </div>

          <div v-if="isInTransit" class="mt-3">
            <p class="text-xs text-muted-foreground">Expected arrival</p>

            <time
              :datetime="ship.nav.route.arrival"
              class="mt-1 block font-mono text-xs tabular-nums text-muted-foreground"
            >
              {{ formatDate(ship.nav.route.arrival) }}
            </time>
          </div>
        </dd>
      </div>

      <div class="min-w-0 border-b border-border bg-card p-4 sm:border-b-0 sm:border-r">
        <dt class="text-xs font-medium text-muted-foreground">Fuel</dt>

        <dd class="mt-2">
          <template v-if="ship.fuel.capacity > 0">
            <p
              class="font-mono text-sm tabular-nums"
              :class="isLowFuel ? 'text-alert' : 'text-foreground'"
            >
              {{ formatNumber(ship.fuel.current) }}

              <span class="text-muted-foreground">
                /
                {{ formatNumber(ship.fuel.capacity) }}
              </span>
            </p>

            <div aria-hidden="true" class="mt-3 h-px bg-muted">
              <div
                class="h-px"
                :class="isLowFuel ? 'bg-alert' : 'bg-signal'"
                :style="{
                  width: `${fuelPercentage}%`,
                }"
              />
            </div>

            <p v-if="ship.fuel.current === 0" class="mt-2 text-xs text-alert">
              Fuel tank is empty.
            </p>
          </template>

          <p v-else class="text-xs text-muted-foreground">No fuel capacity</p>
        </dd>
      </div>

      <div class="min-w-0 bg-card p-4">
        <dt class="text-xs font-medium text-muted-foreground">Cargo</dt>

        <dd class="mt-2">
          <template v-if="ship.cargo.capacity > 0">
            <p class="font-mono text-sm tabular-nums text-foreground">
              {{ formatNumber(ship.cargo.units) }}

              <span class="text-muted-foreground">
                /
                {{ formatNumber(ship.cargo.capacity) }}
              </span>
            </p>

            <div aria-hidden="true" class="mt-3 h-px bg-muted">
              <div
                class="h-px bg-orbit"
                :style="{
                  width: `${cargoPercentage}%`,
                }"
              />
            </div>

            <p class="mt-2 text-xs text-muted-foreground">
              {{
                ship.cargo.inventory.length === 1
                  ? '1 item type'
                  : `${ship.cargo.inventory.length} item types`
              }}
            </p>
          </template>

          <p v-else class="text-xs text-muted-foreground">No cargo capacity</p>
        </dd>
      </div>
    </dl>
  </article>
</template>
