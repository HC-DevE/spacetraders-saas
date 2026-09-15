<script setup lang="ts">
import type { Ship } from '../../schemas/ship.schema'
import { formatDate, formatLabel } from '../../utils/ship-formatters'

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
          {{ nav.systemSymbol }}
        </dd>
      </div>

      <div class="min-w-0">
        <dt class="text-sm text-muted-foreground">Navigation waypoint</dt>
        <dd class="mt-1 font-medium">
          {{ nav.waypointSymbol }}
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
            {{ nav.route.origin.symbol }}
          </p>

          <p class="mt-1 text-sm capitalize text-muted-foreground">
            {{ formatLabel(nav.route.origin.type) }}
            · {{ nav.route.origin.x }}, {{ nav.route.origin.y }}
          </p>

          <p class="mt-1 text-xs text-muted-foreground">
            System {{ nav.route.origin.systemSymbol }}
          </p>
        </div>

        <div class="min-w-0 rounded-lg bg-secondary p-4 text-secondary-foreground">
          <p class="text-xs font-semibold uppercase tracking-wide">Destination</p>

          <p class="mt-2 font-semibold">
            {{ nav.route.destination.symbol }}
          </p>

          <p class="mt-1 text-sm capitalize">
            {{ formatLabel(nav.route.destination.type) }}
            · {{ nav.route.destination.x }}, {{ nav.route.destination.y }}
          </p>

          <p class="mt-1 text-xs">System {{ nav.route.destination.systemSymbol }}</p>
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
