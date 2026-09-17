<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import { ApiError } from '@/shared/api/api-error'
import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'
import { formatDate, formatLabel } from '@/shared/utils/formatters'

import ShipCargo from '../components/ship-detail/ShipCargo.vue'
import ShipCooldown from '../components/ship-detail/ShipCooldown.vue'
import ShipCrew from '../components/ship-detail/ShipCrew.vue'
import ShipEquipment from '../components/ship-detail/ShipEquipment.vue'
import ShipModules from '../components/ship-detail/ShipModules.vue'
import ShipMounts from '../components/ship-detail/ShipMounts.vue'
import ShipNavigation from '../components/ship-detail/ShipNavigation.vue'
import ShipResources from '../components/ship-detail/ShipResources.vue'
import { useShipQuery } from '../composables/use-ship-query'
import { formatShipStatus } from '../utils/ship-status'

const route = useRoute()

const symbol = computed(() => (typeof route.params.symbol === 'string' ? route.params.symbol : ''))

const {
  data: ship,
  error,
  isPending,
  isFetching,
  isPaused,
  dataUpdatedAt,
  refetch,
} = useShipQuery(symbol)

const isNotFound = computed(() => error.value instanceof ApiError && error.value.status === 404)

const status = computed(() => formatShipStatus(ship.value?.nav.status))
</script>

<template>
  <section class="min-w-0 space-y-6 wrap-anywhere">
    <RouterLink
      :to="{ name: routeNames.fleet }"
      aria-label="Back to fleet"
      class="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden="true">←</span>
      Back to fleet
    </RouterLink>

    <header class="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-5">
      <div class="min-w-0">
        <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ship</p>

        <div class="mt-2 flex flex-wrap items-center gap-3">
          <h1 class="min-w-0 font-mono text-2xl font-semibold tracking-tight">
            {{ ship?.registration.name || symbol }}
          </h1>

          <span
            v-if="ship"
            class="inline-flex shrink-0 items-center gap-2 text-sm font-medium"
            :class="status.className"
          >
            <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />

            {{ status.label }}
          </span>
        </div>

        <template v-if="ship">
          <p
            v-if="ship.registration.name !== ship.symbol"
            class="mt-1 font-mono text-xs text-muted-foreground"
          >
            {{ ship.symbol }}
          </p>

          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              {{ ship.frame.name }}
            </span>

            <span class="capitalize">
              {{ formatLabel(ship.registration.role) }}
            </span>

            <span class="font-mono">
              {{ ship.registration.factionSymbol }}
            </span>
          </div>
        </template>
      </div>

      <div v-if="ship" class="flex flex-col items-start gap-2 sm:items-end">
        <AppButton
          variant="outline"
          class="h-8 px-3 text-xs"
          aria-label="Refresh ship"
          :loading="isFetching"
          :disabled="isPaused"
          loading-label="Refreshing…"
          @click="refetch()"
        >
          Refresh
        </AppButton>

        <p v-if="dataUpdatedAt > 0" class="font-mono text-xs text-muted-foreground">
          Updated {{ formatDate(dataUpdatedAt) }}
        </p>
      </div>
    </header>

    <FeedbackState
      v-if="!symbol"
      kind="error"
      title="Invalid ship address"
      description="Return to your fleet and select a ship."
    />

    <FeedbackState
      v-else-if="isPending"
      kind="loading"
      :title="isPaused ? 'Waiting for connection' : 'Loading ship'"
      :description="
        isPaused
          ? 'The request will resume when your connection is available.'
          : 'Fetching this ship’s latest information.'
      "
    />

    <template v-else-if="ship">
      <div
        v-if="error"
        role="alert"
        class="border border-warning/30 bg-warning-subtle p-4 text-warning"
      >
        <p class="font-medium">Could not refresh ship</p>

        <p class="mt-1 text-sm">
          {{ error.message }}
        </p>

        <p class="mt-2 text-sm">The last successfully loaded information is still displayed.</p>
      </div>

      <p v-if="isPaused" role="status" class="text-sm text-muted-foreground">
        Waiting for connection. The displayed information may be outdated.
      </p>

      <p v-else-if="isFetching" role="status" class="text-sm text-muted-foreground">
        Updating ship information…
      </p>

      <div :aria-busy="isFetching" class="space-y-8">
        <ShipResources :fuel="ship.fuel" :cargo="ship.cargo" :crew="ship.crew" />

        <ShipNavigation :nav="ship.nav" />

        <div class="grid gap-4 md:grid-cols-2">
          <ShipCrew :crew="ship.crew" />

          <ShipCooldown :cooldown="ship.cooldown" />
        </div>

        <ShipCargo :cargo="ship.cargo" :ship-symbol="ship.symbol" />

        <ShipEquipment :frame="ship.frame" :reactor="ship.reactor" :engine="ship.engine" />

        <ShipModules :modules="ship.modules" />

        <ShipMounts :mounts="ship.mounts" />
      </div>
    </template>

    <FeedbackState
      v-else-if="error"
      kind="error"
      :title="isNotFound ? 'Ship not found' : 'Unable to load ship'"
      :description="
        isNotFound
          ? 'This ship could not be found. Return to your fleet to select an available ship.'
          : error.message
      "
    >
      <AppButton
        v-if="!isNotFound"
        :loading="isFetching"
        :disabled="isPaused"
        loading-label="Retrying…"
        @click="refetch()"
      >
        Try again
      </AppButton>
    </FeedbackState>
  </section>
</template>
