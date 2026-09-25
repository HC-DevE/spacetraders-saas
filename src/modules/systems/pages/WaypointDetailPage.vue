<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import { ApiError } from '@/shared/api/api-error'
import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'
import { formatLabel } from '@/shared/utils/formatters'

import WaypointOverview from '../components/WaypointOverview.vue'
import { useWaypointQuery } from '../composables/use-waypoint-query'
import { hasWaypointTrait } from '../utils/waypoint-status'

const route = useRoute()
const router = useRouter()

const systemSymbol = computed(() =>
  typeof route.params.systemSymbol === 'string' ? route.params.systemSymbol : '',
)

const waypointSymbol = computed(() =>
  typeof route.params.waypointSymbol === 'string' ? route.params.waypointSymbol : '',
)

const {
  data: waypoint,
  error,
  isPending,
  isFetching,
  isPaused,
  refetch,
} = useWaypointQuery(systemSymbol, waypointSymbol)

const hasMarketplace = computed(() =>
  waypoint.value ? hasWaypointTrait(waypoint.value, 'MARKETPLACE') : false,
)

const isNotFound = computed(() => error.value instanceof ApiError && error.value.status === 404)

function openMarket() {
  return router.push({
    name: routeNames.market,
    params: {
      systemSymbol: systemSymbol.value,
      waypointSymbol: waypointSymbol.value,
    },
  })
}
</script>

<template>
  <section class="min-w-0 space-y-6 wrap-anywhere">
    <RouterLink
      :to="{
        name: routeNames.systemDetail,
        params: {
          systemSymbol,
        },
      }"
      aria-label="Back to system"
      class="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden="true"> ← </span>

      Back to system
    </RouterLink>

    <FeedbackState
      v-if="!systemSymbol || !waypointSymbol"
      kind="error"
      title="Invalid waypoint address"
      description="Return to the system and select a waypoint."
    />

    <FeedbackState
      v-else-if="isPending"
      kind="loading"
      :title="isPaused ? 'Waiting for connection' : 'Loading waypoint'"
      :description="
        isPaused
          ? 'The request will resume when your connection is available.'
          : 'Fetching this waypoint’s information.'
      "
    />

    <template v-else-if="waypoint">
      <header class="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-5">
        <div class="min-w-0">
          <p class="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Waypoint
          </p>

          <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 class="min-w-0 font-mono text-2xl font-semibold tracking-tight">
              {{ waypoint.symbol }}
            </h1>

            <span class="text-xs font-medium capitalize text-orbit">
              {{ formatLabel(waypoint.type) }}
            </span>
          </div>

          <p class="mt-2 font-mono text-xs text-muted-foreground">
            {{ waypoint.systemSymbol }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <AppButton
            v-if="hasMarketplace"
            size="sm"
            aria-label="Open waypoint market"
            @click="openMarket"
          >
            Open market
          </AppButton>

          <AppButton
            variant="outline"
            size="sm"
            aria-label="Refresh waypoint"
            :loading="isFetching"
            :disabled="isPaused"
            loading-label="Refreshing…"
            @click="refetch()"
          >
            Refresh
          </AppButton>
        </div>
      </header>

      <div
        v-if="error"
        role="alert"
        class="border border-warning/30 bg-warning-subtle p-4 text-warning"
      >
        <p class="font-medium">Could not refresh waypoint</p>

        <p class="mt-1 text-sm">
          {{ error.message }}
        </p>

        <p class="mt-2 text-sm">The last successfully loaded information is still displayed.</p>
      </div>

      <p v-if="isPaused" role="status" class="text-sm text-muted-foreground">
        Waypoint refresh is waiting for a connection.
      </p>

      <p v-else-if="isFetching" role="status" class="text-sm text-muted-foreground">
        Updating waypoint information…
      </p>

      <WaypointOverview :waypoint="waypoint" />
    </template>

    <FeedbackState
      v-else-if="error"
      kind="error"
      :title="isNotFound ? 'Waypoint not found' : 'Unable to load waypoint'"
      :description="
        isNotFound
          ? 'This waypoint could not be found. Return to the system to select another waypoint.'
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
