<script setup lang="ts">
import { RouterLink } from 'vue-router'

import type { Ship } from '@/modules/fleet/schemas/ship.schema'
import { formatDate, formatLabel } from '@/shared/utils/formatters'
import { routeNames } from '@/app/router/route-names'

defineProps<{ nav: Ship['nav'] }>()
</script>

<template>
  <section class="min-w-0 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-lg font-semibold">Navigation</h2>

      <p class="text-sm text-muted-foreground">
        Flight mode:
        <span class="font-medium capitalize text-foreground">
          {{ formatLabel(nav.flightMode) }}
        </span>
      </p>
    </header>

    <dl class="mt-5 grid gap-4 sm:grid-cols-2">
      <div class="min-w-0">
        <dt class="text-sm text-muted-foreground">System</dt>
        <dd class="mt-1 font-medium">
          <RouterLink
            :to="{ name: routeNames.systemDetail, params: { systemSymbol: nav.systemSymbol } }"
            :aria-label="`Open system ${nav.systemSymbol}`"
            class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ nav.systemSymbol }}
          </RouterLink>
        </dd>
      </div>

      <div class="min-w-0">
        <dt class="text-sm text-muted-foreground">Navigation waypoint</dt>
        <dd class="mt-1 font-medium">
          <RouterLink
            :to="{
              name: routeNames.waypointDetail,
              params: {
                systemSymbol: nav.systemSymbol,
                waypointSymbol: nav.waypointSymbol,
              },
            }"
            :aria-label="`Open waypoint ${nav.waypointSymbol}`"
            class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ nav.waypointSymbol }}
          </RouterLink>
        </dd>
      </div>
    </dl>

    <div class="mt-5 border-t pt-5">
      <h3 class="font-semibold">
        {{ nav.status === 'IN_TRANSIT' ? 'Current journey' : 'Last recorded route' }}
      </h3>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="min-w-0 rounded-lg bg-muted p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Origin</p>

          <p class="mt-2 font-semibold">
            <RouterLink
              :to="{
                name: routeNames.waypointDetail,
                params: {
                  systemSymbol: nav.route.origin.systemSymbol,
                  waypointSymbol: nav.route.origin.symbol,
                },
              }"
              :aria-label="`Open origin waypoint ${nav.route.origin.symbol}`"
              class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ nav.route.origin.symbol }}
            </RouterLink>
          </p>

          <p class="mt-1 text-sm capitalize text-muted-foreground">
            {{ formatLabel(nav.route.origin.type) }}
            · {{ nav.route.origin.x }}, {{ nav.route.origin.y }}
          </p>

          <p class="mt-1 text-xs text-muted-foreground">
            System
            <RouterLink
              :to="{
                name: routeNames.systemDetail,
                params: { systemSymbol: nav.route.origin.systemSymbol },
              }"
              :aria-label="`Open origin system ${nav.route.origin.systemSymbol}`"
              class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ nav.route.origin.systemSymbol }}
            </RouterLink>
          </p>
        </div>

        <div class="min-w-0 rounded-lg bg-secondary p-4 text-secondary-foreground">
          <p class="text-xs font-semibold uppercase tracking-wide">Destination</p>

          <p class="mt-2 font-semibold">
            <RouterLink
              :to="{
                name: routeNames.waypointDetail,
                params: {
                  systemSymbol: nav.route.destination.systemSymbol,
                  waypointSymbol: nav.route.destination.symbol,
                },
              }"
              :aria-label="`Open destination waypoint ${nav.route.destination.symbol}`"
              class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ nav.route.destination.symbol }}
            </RouterLink>
          </p>

          <p class="mt-1 text-sm capitalize">
            {{ formatLabel(nav.route.destination.type) }}
            · {{ nav.route.destination.x }}, {{ nav.route.destination.y }}
          </p>

          <p class="mt-1 text-xs">
            System
            <RouterLink
              :to="{
                name: routeNames.systemDetail,
                params: { systemSymbol: nav.route.destination.systemSymbol },
              }"
              :aria-label="`Open destination system ${nav.route.destination.systemSymbol}`"
              class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ nav.route.destination.systemSymbol }}
            </RouterLink>
          </p>
        </div>
      </div>

      <dl class="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div class="min-w-0">
          <dt class="text-muted-foreground">Departure</dt>
          <dd class="mt-1">
            <time :datetime="nav.route.departureTime">
              {{ formatDate(nav.route.departureTime) }}
            </time>
          </dd>
        </div>

        <div class="min-w-0">
          <dt class="text-muted-foreground">
            {{ nav.status === 'IN_TRANSIT' ? 'Expected arrival' : 'Recorded arrival' }}
          </dt>
          <dd class="mt-1">
            <time :datetime="nav.route.arrival">
              {{ formatDate(nav.route.arrival) }}
            </time>
          </dd>
        </div>
      </dl>

      <p class="mt-4 text-xs text-muted-foreground">
        Route information reflects the latest API response.
      </p>
    </div>
  </section>
</template>
