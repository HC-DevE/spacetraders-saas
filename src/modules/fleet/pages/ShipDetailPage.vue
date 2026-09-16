<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { ApiError } from '@/shared/api/api-error'
import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'

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
import { formatDate, formatLabel } from '@/shared/utils/formatters.ts'
import { routeNames } from '@/app/router/route-names'

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
      class="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      <span aria-hidden="true">←</span>
      Back to fleet
    </RouterLink>

    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="text-sm font-medium text-muted-foreground">Ship details</p>

        <div class="mt-1 flex flex-wrap items-center gap-3">
          <h1 class="min-w-0 text-2xl font-semibold tracking-tight">
            {{ ship?.registration.name || symbol }}
          </h1>

          <span
            v-if="ship"
            class="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
            :class="status.className"
          >
            {{ status.label }}
          </span>
        </div>

        <template v-if="ship">
          <p
            v-if="ship.registration.name !== ship.symbol"
            class="mt-1 text-sm text-muted-foreground"
          >
            {{ ship.symbol }}
          </p>

          <p class="mt-2 text-sm text-muted-foreground">
            {{ ship.frame.name }}
            <span aria-hidden="true"> · </span>
            <span class="capitalize">
              {{ formatLabel(ship.registration.role) }}
            </span>
            <span aria-hidden="true"> · </span>
            {{ ship.registration.factionSymbol }}
          </p>
        </template>
      </div>

      <div v-if="ship" class="min-w-0 space-y-2 sm:text-right">
        <AppButton
          variant="outline"
          aria-label="Refresh ship"
          :loading="isFetching"
          :disabled="isPaused"
          loading-label="Refreshing…"
          @click="refetch()"
        >
          Refresh ship
        </AppButton>

        <p v-if="dataUpdatedAt > 0" class="text-xs text-muted-foreground">
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
        class="rounded-xl border border-warning/30 bg-warning-subtle p-4 text-warning"
      >
        <p class="font-semibold">Could not refresh ship</p>
        <p class="mt-1 text-sm">{{ error.message }}</p>
        <p class="mt-2 text-sm">The last successfully loaded information is still displayed.</p>
      </div>

      <p v-if="isPaused" role="status" class="text-sm text-muted-foreground">
        Waiting for connection. The displayed information may be outdated.
      </p>

      <p v-else-if="isFetching" role="status" class="text-sm text-muted-foreground">
        Updating ship information…
      </p>

      <div :aria-busy="isFetching" class="space-y-6">
        <ShipResources :fuel="ship.fuel" :cargo="ship.cargo" :crew="ship.crew" />
        <ShipNavigation :nav="ship.nav" />

        <div class="grid gap-6 md:grid-cols-2">
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
