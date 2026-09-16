<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { formatDate, formatLabel } from '@/shared/utils/formatters'

import type { Waypoint } from '../schemas/waypoint.schema'
import { getMarketplaceStatus } from '../utils/waypoint-status'
import { routeNames } from '@/app/router/route-names'

const props = defineProps<{
  waypoint: Waypoint
}>()

const marketplaceStatus = computed(() => getMarketplaceStatus(props.waypoint))
</script>

<template>
  <div class="space-y-6">
    <section
      aria-labelledby="waypoint-overview-title"
      class="rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="waypoint-overview-title" class="text-lg font-semibold">Waypoint overview</h2>

          <p class="mt-1 text-sm text-muted-foreground">Location and operational information.</p>
        </div>

        <span
          class="rounded-full bg-secondary px-3 py-1 text-xs font-semibold capitalize text-secondary-foreground"
        >
          {{ formatLabel(waypoint.type) }}
        </span>
      </div>

      <dl class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg bg-muted p-4">
          <dt class="text-xs font-medium text-muted-foreground">System</dt>

          <dd class="mt-1 font-semibold">
            <RouterLink
              :to="{
                name: routeNames.systemDetail,
                params: { systemSymbol: waypoint.systemSymbol },
              }"
              :aria-label="`Open system ${waypoint.systemSymbol}`"
              class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ waypoint.systemSymbol }}
            </RouterLink>
          </dd>
        </div>

        <div class="rounded-lg bg-muted p-4">
          <dt class="text-xs font-medium text-muted-foreground">Coordinates</dt>

          <dd class="mt-1 font-semibold tabular-nums">{{ waypoint.x }}, {{ waypoint.y }}</dd>
        </div>

        <div class="rounded-lg bg-muted p-4">
          <dt class="text-xs font-medium text-muted-foreground">Faction</dt>

          <dd class="mt-1 font-semibold">
            {{ waypoint.faction?.symbol || 'None reported' }}
          </dd>
        </div>

        <div class="rounded-lg bg-muted p-4">
          <dt class="text-xs font-medium text-muted-foreground">Construction</dt>

          <dd class="mt-1 font-semibold">
            {{ waypoint.isUnderConstruction ? 'Under construction' : 'Operational' }}
          </dd>
        </div>

        <div class="rounded-lg bg-muted p-4">
          <dt class="text-xs font-medium text-muted-foreground">Marketplace</dt>

          <dd class="mt-1 font-semibold">
            {{ marketplaceStatus }}
          </dd>
        </div>

        <div class="rounded-lg bg-muted p-4">
          <dt class="text-xs font-medium text-muted-foreground">Parent orbit</dt>

          <dd class="mt-1 font-semibold">
            <RouterLink
              v-if="waypoint.orbits"
              :to="{
                name: routeNames.waypointDetail,
                params: {
                  systemSymbol: waypoint.systemSymbol,
                  waypointSymbol: waypoint.orbits,
                },
              }"
              :aria-label="`Open parent waypoint ${waypoint.orbits}`"
              class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ waypoint.orbits }}
            </RouterLink>

            <span v-else>None</span>
          </dd>
        </div>

        <div class="rounded-lg bg-muted p-4">
          <dt class="text-xs font-medium text-muted-foreground">Orbitals</dt>

          <dd class="mt-1 font-semibold tabular-nums">
            {{ waypoint.orbitals.length }}
          </dd>
        </div>

        <div class="rounded-lg bg-muted p-4">
          <dt class="text-xs font-medium text-muted-foreground">Chart</dt>

          <dd class="mt-1 font-semibold">
            {{ waypoint.chart ? 'Available' : 'Not reported' }}
          </dd>
        </div>
      </dl>
    </section>

    <section
      aria-labelledby="waypoint-traits-title"
      class="rounded-xl border bg-card p-5 shadow-sm"
    >
      <h2 id="waypoint-traits-title" class="text-lg font-semibold">Traits</h2>

      <p class="mt-1 text-sm text-muted-foreground">
        Permanent characteristics reported for this waypoint.
      </p>

      <div v-if="waypoint.traits.length" class="mt-5 grid gap-4 md:grid-cols-2">
        <article
          v-for="trait in waypoint.traits"
          :key="trait.symbol"
          class="rounded-lg bg-muted p-4"
        >
          <h3 class="font-semibold">
            {{ trait.name }}
          </h3>

          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            {{ trait.description }}
          </p>
        </article>
      </div>

      <p v-else class="mt-4 text-sm text-muted-foreground">No traits reported.</p>
    </section>

    <section
      v-if="waypoint.modifiers?.length"
      aria-labelledby="waypoint-modifiers-title"
      class="rounded-xl border bg-card p-5 shadow-sm"
    >
      <h2 id="waypoint-modifiers-title" class="text-lg font-semibold">Active modifiers</h2>

      <p class="mt-1 text-sm text-muted-foreground">
        Temporary effects currently affecting this waypoint.
      </p>

      <div class="mt-5 grid gap-4 md:grid-cols-2">
        <article
          v-for="modifier in waypoint.modifiers"
          :key="modifier.symbol"
          class="rounded-lg bg-muted p-4"
        >
          <h3 class="font-semibold">
            {{ modifier.name }}
          </h3>

          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            {{ modifier.description }}
          </p>
        </article>
      </div>
    </section>

    <section
      v-if="waypoint.orbitals.length"
      aria-labelledby="waypoint-orbitals-title"
      class="rounded-xl border bg-card p-5 shadow-sm"
    >
      <h2 id="waypoint-orbitals-title" class="text-lg font-semibold">Orbitals</h2>

      <ul class="mt-4 flex flex-wrap gap-2">
        <li v-for="orbital in waypoint.orbitals" :key="orbital.symbol">
          <RouterLink
            :to="{
              name: routeNames.waypointDetail,
              params: {
                systemSymbol: waypoint.systemSymbol,
                waypointSymbol: orbital.symbol,
              },
            }"
            :aria-label="`Open orbital waypoint ${orbital.symbol}`"
            class="block rounded-md bg-muted px-3 py-2 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ orbital.symbol }}
          </RouterLink>
        </li>
      </ul>
    </section>

    <section
      v-if="waypoint.chart"
      aria-labelledby="waypoint-chart-title"
      class="rounded-xl border bg-card p-5 shadow-sm"
    >
      <h2 id="waypoint-chart-title" class="text-lg font-semibold">Chart information</h2>

      <dl class="mt-4 grid gap-4 sm:grid-cols-2">
        <div v-if="waypoint.chart.submittedBy">
          <dt class="text-xs text-muted-foreground">Submitted by</dt>

          <dd class="mt-1 font-semibold">
            {{ waypoint.chart.submittedBy }}
          </dd>
        </div>

        <div v-if="waypoint.chart.submittedOn">
          <dt class="text-xs text-muted-foreground">Submitted on</dt>

          <dd class="mt-1 font-semibold">
            {{ formatDate(waypoint.chart.submittedOn) }}
          </dd>
        </div>
      </dl>
    </section>
  </div>
</template>
