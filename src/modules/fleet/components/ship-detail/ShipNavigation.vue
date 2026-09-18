<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import { formatDate, formatLabel } from '@/shared/utils/formatters'

import type { Ship } from '../../schemas/ship.schema'

defineProps<{
  nav: Ship['nav']
}>()
</script>

<template>
  <section class="min-w-0">
    <header class="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold">Navigation</h2>

        <p class="mt-1 text-sm text-muted-foreground">Latest position and recorded route.</p>
      </div>

      <p class="text-xs text-muted-foreground">
        Flight mode
        <span class="ml-2 font-mono text-foreground">
          {{ formatLabel(nav.flightMode) }}
        </span>
      </p>
    </header>

    <div class="border border-border bg-card">
      <dl class="grid gap-px bg-border sm:grid-cols-2">
        <div class="min-w-0 bg-card p-4">
          <dt class="text-xs text-muted-foreground">System</dt>

          <dd class="mt-2 min-w-0">
            <RouterLink
              :to="{
                name: routeNames.systemDetail,
                params: {
                  systemSymbol: nav.systemSymbol,
                },
              }"
              :aria-label="`Open system ${nav.systemSymbol}`"
              class="block truncate rounded-sm font-mono text-sm font-medium underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ nav.systemSymbol }}
            </RouterLink>
          </dd>
        </div>

        <div class="min-w-0 bg-card p-4">
          <dt class="text-xs text-muted-foreground">Navigation waypoint</dt>

          <dd class="mt-2 min-w-0">
            <RouterLink
              :to="{
                name: routeNames.waypointDetail,
                params: {
                  systemSymbol: nav.systemSymbol,
                  waypointSymbol: nav.waypointSymbol,
                },
              }"
              :aria-label="`Open waypoint ${nav.waypointSymbol}`"
              class="block truncate rounded-sm font-mono text-sm font-medium underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ nav.waypointSymbol }}
            </RouterLink>
          </dd>
        </div>
      </dl>

      <div class="border-t border-border">
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h3 class="text-sm font-medium">
            {{ nav.status === 'IN_TRANSIT' ? 'Current journey' : 'Last recorded route' }}
          </h3>

          <span
            v-if="nav.status === 'IN_TRANSIT'"
            class="inline-flex items-center gap-2 text-xs text-signal"
          >
            <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
            In transit
          </span>
        </div>

        <div class="grid gap-px border-t border-border bg-border md:grid-cols-2">
          <!-- Origin -->
          <div class="min-w-0 bg-card p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Origin</p>

            <RouterLink
              :to="{
                name: routeNames.waypointDetail,
                params: {
                  systemSymbol: nav.route.origin.systemSymbol,
                  waypointSymbol: nav.route.origin.symbol,
                },
              }"
              :aria-label="`Open origin waypoint ${nav.route.origin.symbol}`"
              class="mt-3 block truncate rounded-sm font-mono text-sm font-medium underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ nav.route.origin.symbol }}
            </RouterLink>

            <p class="mt-2 text-xs capitalize text-muted-foreground">
              {{ formatLabel(nav.route.origin.type) }}
              <span aria-hidden="true"> · </span>
              <span class="font-mono">
                {{ nav.route.origin.x }},
                {{ nav.route.origin.y }}
              </span>
            </p>

            <RouterLink
              :to="{
                name: routeNames.systemDetail,
                params: {
                  systemSymbol: nav.route.origin.systemSymbol,
                },
              }"
              :aria-label="`Open origin system ${nav.route.origin.systemSymbol}`"
              class="mt-2 inline-block rounded-sm font-mono text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ nav.route.origin.systemSymbol }}
            </RouterLink>
          </div>

          <!-- Destination -->
          <div class="min-w-0 bg-card p-4">
            <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Destination
            </p>

            <RouterLink
              :to="{
                name: routeNames.waypointDetail,
                params: {
                  systemSymbol: nav.route.destination.systemSymbol,
                  waypointSymbol: nav.route.destination.symbol,
                },
              }"
              :aria-label="`Open destination waypoint ${nav.route.destination.symbol}`"
              class="mt-3 block truncate rounded-sm font-mono text-sm font-medium text-signal underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ nav.route.destination.symbol }}
            </RouterLink>

            <p class="mt-2 text-xs capitalize text-muted-foreground">
              {{ formatLabel(nav.route.destination.type) }}
              <span aria-hidden="true"> · </span>
              <span class="font-mono">
                {{ nav.route.destination.x }},
                {{ nav.route.destination.y }}
              </span>
            </p>

            <RouterLink
              :to="{
                name: routeNames.systemDetail,
                params: {
                  systemSymbol: nav.route.destination.systemSymbol,
                },
              }"
              :aria-label="`Open destination system ${nav.route.destination.systemSymbol}`"
              class="mt-2 inline-block rounded-sm font-mono text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ nav.route.destination.systemSymbol }}
            </RouterLink>
          </div>
        </div>

        <dl class="grid gap-px border-t border-border bg-border sm:grid-cols-2">
          <div class="bg-card px-4 py-3">
            <dt class="text-xs text-muted-foreground">Departure</dt>

            <dd class="mt-1">
              <time :datetime="nav.route.departureTime" class="font-mono text-xs">
                {{ formatDate(nav.route.departureTime) }}
              </time>
            </dd>
          </div>

          <div class="bg-card px-4 py-3">
            <dt class="text-xs text-muted-foreground">
              {{ nav.status === 'IN_TRANSIT' ? 'Expected arrival' : 'Recorded arrival' }}
            </dt>

            <dd class="mt-1">
              <time :datetime="nav.route.arrival" class="font-mono text-xs">
                {{ formatDate(nav.route.arrival) }}
              </time>
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <p class="mt-2 text-xs text-muted-foreground">
      Route information reflects the latest API response.
    </p>
  </section>
</template>
