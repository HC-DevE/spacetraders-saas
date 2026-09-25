<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import { formatDate, formatLabel } from '@/shared/utils/formatters'

import type { Waypoint } from '../schemas/waypoint.schema'
import { getMarketplaceStatus } from '../utils/waypoint-status'

const props = defineProps<{
  waypoint: Waypoint
}>()

const marketplaceStatus = computed(() => getMarketplaceStatus(props.waypoint))

const marketplaceStatusClass = computed(() => {
  switch (marketplaceStatus.value) {
    case 'Available':
      return 'text-signal'

    case 'Unknown':
      return 'text-warning'

    default:
      return 'text-muted-foreground'
  }
})

const constructionStatus = computed(() =>
  props.waypoint.isUnderConstruction ? 'Under construction' : 'Operational',
)

const constructionStatusClass = computed(() =>
  props.waypoint.isUnderConstruction ? 'text-warning' : 'text-muted-foreground',
)

const hasChartMetadata = computed(
  () => Boolean(props.waypoint.chart?.submittedBy) || Boolean(props.waypoint.chart?.submittedOn),
)
</script>

<template>
  <div class="space-y-8">
    <section aria-labelledby="waypoint-overview-title">
      <div>
        <h2 id="waypoint-overview-title" class="text-base font-semibold">Waypoint overview</h2>

        <p class="mt-1 text-sm text-muted-foreground">
          Location, availability and orbital information.
        </p>
      </div>

      <dl class="mt-4 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        <div class="min-w-0 bg-card p-4">
          <dt class="text-xs text-muted-foreground">Type</dt>

          <dd class="mt-1 text-sm font-medium capitalize text-orbit">
            {{ formatLabel(waypoint.type) }}
          </dd>
        </div>

        <div class="min-w-0 bg-card p-4">
          <dt class="text-xs text-muted-foreground">System</dt>

          <dd class="mt-1 min-w-0">
            <RouterLink
              :to="{
                name: routeNames.systemDetail,
                params: {
                  systemSymbol: waypoint.systemSymbol,
                },
              }"
              :aria-label="`Open system ${waypoint.systemSymbol}`"
              class="inline-block max-w-full truncate rounded-sm font-mono text-sm font-medium text-foreground underline-offset-4 hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ waypoint.systemSymbol }}
            </RouterLink>
          </dd>
        </div>

        <div class="min-w-0 bg-card p-4">
          <dt class="text-xs text-muted-foreground">Coordinates</dt>

          <dd class="mt-1 font-mono text-sm font-medium tabular-nums">
            {{ waypoint.x }},
            {{ waypoint.y }}
          </dd>
        </div>

        <div class="min-w-0 bg-card p-4">
          <dt class="text-xs text-muted-foreground">Faction</dt>

          <dd class="mt-1 font-mono text-sm font-medium">
            {{ waypoint.faction?.symbol ?? 'None reported' }}
          </dd>
        </div>

        <div class="min-w-0 bg-card p-4">
          <dt class="text-xs text-muted-foreground">Construction</dt>

          <dd
            class="mt-1 inline-flex items-center gap-2 text-sm font-medium"
            :class="constructionStatusClass"
          >
            <span class="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />

            {{ constructionStatus }}
          </dd>
        </div>

        <div class="min-w-0 bg-card p-4">
          <dt class="text-xs text-muted-foreground">Marketplace</dt>

          <dd class="mt-1 text-sm font-medium" :class="marketplaceStatusClass">
            {{ marketplaceStatus }}
          </dd>
        </div>

        <div class="min-w-0 bg-card p-4">
          <dt class="text-xs text-muted-foreground">Parent orbit</dt>

          <dd class="mt-1 min-w-0">
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
              class="inline-block max-w-full truncate rounded-sm font-mono text-sm font-medium text-foreground underline-offset-4 hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ waypoint.orbits }}
            </RouterLink>

            <span v-else class="text-sm text-muted-foreground"> None </span>
          </dd>
        </div>

        <div class="min-w-0 bg-card p-4">
          <dt class="text-xs text-muted-foreground">Orbitals</dt>

          <dd class="mt-1 font-mono text-sm font-medium tabular-nums">
            {{ waypoint.orbitals.length }}
          </dd>
        </div>

        <div class="min-w-0 bg-card p-4">
          <dt class="text-xs text-muted-foreground">Chart</dt>

          <dd
            class="mt-1 text-sm font-medium"
            :class="waypoint.chart ? 'text-foreground' : 'text-muted-foreground'"
          >
            {{ waypoint.chart ? 'Available' : 'Not reported' }}
          </dd>
        </div>
      </dl>
    </section>

    <section aria-labelledby="waypoint-traits-title" class="border-t border-border pt-6">
      <div>
        <h2 id="waypoint-traits-title" class="text-base font-semibold">Traits</h2>

        <p class="mt-1 text-sm text-muted-foreground">
          Permanent characteristics reported for this waypoint.
        </p>
      </div>

      <ul v-if="waypoint.traits.length" class="mt-4 grid gap-4 md:grid-cols-2">
        <li
          v-for="trait in waypoint.traits"
          :key="trait.symbol"
          class="border border-border bg-card p-5"
          :class="{
            'border-signal/40': trait.symbol === 'MARKETPLACE',
          }"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <h3 class="font-medium text-foreground">
              {{ trait.name }}
            </h3>

            <span v-if="trait.symbol === 'MARKETPLACE'" class="text-xs font-medium text-signal">
              Marketplace
            </span>
          </div>

          <p class="mt-3 text-sm leading-6 text-muted-foreground">
            {{ trait.description }}
          </p>
        </li>
      </ul>

      <p v-else class="mt-4 text-sm text-muted-foreground">No traits reported.</p>
    </section>

    <section
      v-if="waypoint.modifiers?.length"
      aria-labelledby="waypoint-modifiers-title"
      class="border-t border-border pt-6"
    >
      <div>
        <h2 id="waypoint-modifiers-title" class="text-base font-semibold">Active modifiers</h2>

        <p class="mt-1 text-sm text-muted-foreground">
          Temporary effects currently affecting this waypoint.
        </p>
      </div>

      <ul class="mt-4 grid gap-4 md:grid-cols-2">
        <li
          v-for="modifier in waypoint.modifiers"
          :key="modifier.symbol"
          class="border border-warning/30 bg-card p-5"
        >
          <h3 class="font-medium text-warning">
            {{ modifier.name }}
          </h3>

          <p class="mt-3 text-sm leading-6 text-muted-foreground">
            {{ modifier.description }}
          </p>
        </li>
      </ul>
    </section>

    <section
      v-if="waypoint.orbitals.length"
      aria-labelledby="waypoint-orbitals-title"
      class="border-t border-border pt-6"
    >
      <div>
        <h2 id="waypoint-orbitals-title" class="text-base font-semibold">Orbitals</h2>

        <p class="mt-1 text-sm text-muted-foreground">Waypoints orbiting this location.</p>
      </div>

      <ul class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            class="flex min-h-12 items-center justify-between gap-3 border border-border bg-card px-4 py-3 outline-none transition-colors hover:border-signal/40 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span class="min-w-0 truncate font-mono text-sm font-medium">
              {{ orbital.symbol }}
            </span>

            <span class="shrink-0 text-xs text-muted-foreground"> Open </span>
          </RouterLink>
        </li>
      </ul>
    </section>

    <section
      v-if="waypoint.chart"
      aria-labelledby="waypoint-chart-title"
      class="border-t border-border pt-6"
    >
      <div>
        <h2 id="waypoint-chart-title" class="text-base font-semibold">Chart information</h2>

        <p class="mt-1 text-sm text-muted-foreground">
          Available chart submission metadata for this waypoint.
        </p>
      </div>

      <div class="mt-4 border border-border bg-card p-5">
        <dl v-if="hasChartMetadata" class="grid gap-5 sm:grid-cols-2">
          <div v-if="waypoint.chart.submittedBy">
            <dt class="text-xs text-muted-foreground">Submitted by</dt>

            <dd class="mt-1 font-mono text-sm font-medium">
              {{ waypoint.chart.submittedBy }}
            </dd>
          </div>

          <div v-if="waypoint.chart.submittedOn">
            <dt class="text-xs text-muted-foreground">Submitted on</dt>

            <dd class="mt-1">
              <time :datetime="waypoint.chart.submittedOn" class="font-mono text-sm font-medium">
                {{ formatDate(waypoint.chart.submittedOn) }}
              </time>
            </dd>
          </div>
        </dl>

        <p v-else class="text-sm text-muted-foreground">
          Chart available, but submission metadata was not reported.
        </p>
      </div>
    </section>
  </div>
</template>
