<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { ApiError } from '@/shared/api/api-error'
import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'

import SystemOverview from '../components/SystemOverview.vue'
import WaypointList from '../components/WaypointList.vue'
import { useSystemQuery } from '../composables/use-system-query'
import { useWaypointsQuery } from '../composables/use-waypoints-query'
import {
  waypointsParamsSchema,
  waypointsSearchSchema,
  type WaypointsParams,
} from '../schemas/waypoints.schema'
import { routeNames } from '@/app/router/route-names.ts'
import { formatLabel } from '@/shared/utils/formatters.ts'

const route = useRoute()
const router = useRouter()

const systemSymbol = computed(() =>
  typeof route.params.systemSymbol === 'string' ? route.params.systemSymbol : '',
)

const search = computed(() => waypointsSearchSchema.parse(route.query))

const waypointParams = computed<WaypointsParams>(() => ({
  page: search.value.page,
  limit: search.value.limit,
  traits: search.value.marketplace ? ['MARKETPLACE'] : undefined,
}))

const {
  data: system,
  error: systemError,
  isPending: isSystemPending,
  isFetching: isSystemFetching,
  isPaused: isSystemPaused,
  refetch: refetchSystem,
} = useSystemQuery(systemSymbol)

const {
  data: waypoints,
  error: waypointsError,
  isPending: isWaypointsPending,
  isFetching: isWaypointsFetching,
  isPaused: isWaypointsPaused,
  isPlaceholderData,
  refetch: refetchWaypoints,
} = useWaypointsQuery(systemSymbol, waypointParams)

const isSystemNotFound = computed(
  () => systemError.value instanceof ApiError && systemError.value.status === 404,
)

async function replaceWaypointSearch(next: { page: number; limit: number; marketplace: boolean }) {
  await router.replace({
    query: {
      page: String(next.page),
      limit: String(next.limit),
      ...(next.marketplace ? { marketplace: 'true' } : {}),
    },
  })
}

async function changeWaypointPage(page: number) {
  if (isWaypointsFetching.value) return

  const parsed = waypointsParamsSchema.safeParse({
    page,
    limit: search.value.limit,
    traits: search.value.marketplace ? ['MARKETPLACE'] : undefined,
  })

  if (!parsed.success) return

  await replaceWaypointSearch({
    page: parsed.data.page,
    limit: parsed.data.limit,
    marketplace: search.value.marketplace,
  })
}

async function changeWaypointLimit(limit: number) {
  if (isWaypointsFetching.value) return

  const parsed = waypointsParamsSchema.safeParse({
    page: 1,
    limit,
    traits: search.value.marketplace ? ['MARKETPLACE'] : undefined,
  })

  if (!parsed.success) return

  await replaceWaypointSearch({
    page: 1,
    limit: parsed.data.limit,
    marketplace: search.value.marketplace,
  })
}

async function changeMarketplace(enabled: boolean) {
  if (isWaypointsFetching.value) return

  await replaceWaypointSearch({
    page: 1,
    limit: search.value.limit,
    marketplace: enabled,
  })
}
</script>

<template>
  <section class="min-w-0 space-y-8 wrap-anywhere">
    <RouterLink
      :to="{ name: routeNames.systems }"
      aria-label="Back to systems"
      class="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span aria-hidden="true">←</span>
      Back to systems
    </RouterLink>

    <FeedbackState
      v-if="!systemSymbol"
      kind="error"
      title="Invalid system address"
      description="Return to the systems list and select a system."
    />

    <FeedbackState
      v-else-if="isSystemPending"
      kind="loading"
      :title="isSystemPaused ? 'Waiting for connection' : 'Loading system'"
      :description="
        isSystemPaused
          ? 'The request will resume when your connection is available.'
          : 'Fetching this system’s information.'
      "
    />

    <template v-else-if="system">
      <header class="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-5">
        <div class="min-w-0">
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">System</p>

          <h1 class="mt-2 min-w-0 font-mono text-2xl font-semibold tracking-tight">
            {{ system.name || system.symbol }}
          </h1>

          <p v-if="system.name" class="mt-1 font-mono text-xs text-muted-foreground">
            {{ system.symbol }}
          </p>

          <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span class="capitalize text-orbit">
              {{ formatLabel(system.type) }}
            </span>

            <span class="font-mono">
              {{ system.sectorSymbol }}
            </span>

            <span class="font-mono tabular-nums">
              {{ system.x }},
              {{ system.y }}
            </span>
          </div>
        </div>

        <AppButton
          variant="outline"
          class="h-8 px-3 text-xs"
          aria-label="Refresh system"
          :loading="isSystemFetching"
          :disabled="isSystemPaused"
          loading-label="Refreshing…"
          @click="refetchSystem()"
        >
          Refresh
        </AppButton>
      </header>

      <div
        v-if="systemError"
        role="alert"
        class="border border-warning/30 bg-warning-subtle p-4 text-warning"
      >
        <p class="font-medium">Could not refresh system</p>

        <p class="mt-1 text-sm">
          {{ systemError.message }}
        </p>

        <p class="mt-2 text-sm">The last successfully loaded information is still displayed.</p>
      </div>

      <p v-if="isSystemPaused" role="status" class="text-sm text-muted-foreground">
        System refresh is waiting for a connection.
      </p>

      <p v-else-if="isSystemFetching" role="status" class="text-sm text-muted-foreground">
        Updating system information…
      </p>

      <SystemOverview :system="system" />

      <section aria-labelledby="waypoints-title" class="space-y-5 border-t border-border pt-8">
        <header class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="waypoints-title" class="text-lg font-semibold tracking-tight">Waypoints</h2>

            <p class="mt-1 text-sm text-muted-foreground">
              Explore known locations and installations in this system.
            </p>
          </div>

          <AppButton
            variant="outline"
            class="h-8 px-3 text-xs"
            aria-label="Refresh waypoints"
            :loading="isWaypointsFetching"
            :disabled="isWaypointsPaused"
            loading-label="Refreshing…"
            @click="refetchWaypoints()"
          >
            Refresh
          </AppButton>
        </header>

        <FeedbackState
          v-if="isWaypointsPending"
          kind="loading"
          :title="isWaypointsPaused ? 'Waiting for connection' : 'Loading waypoints'"
          :description="
            isWaypointsPaused
              ? 'The request will resume when your connection is available.'
              : 'Retrieving waypoints in this system.'
          "
        />

        <template v-else-if="waypoints">
          <div
            v-if="waypointsError"
            role="alert"
            class="border border-warning/30 bg-warning-subtle p-4 text-warning"
          >
            <p class="font-medium">Could not refresh waypoints</p>

            <p class="mt-1 text-sm">
              {{ waypointsError.message }}
            </p>

            <p class="mt-2 text-sm">
              Previously loaded waypoints remain visible and may be outdated.
            </p>
          </div>

          <p v-if="isPlaceholderData" role="status" class="text-sm text-muted-foreground">
            {{
              isWaypointsPaused
                ? `Waiting for a connection to load page ${search.page}.`
                : `Loading page ${search.page}.`
            }}

            Results from page
            {{ waypoints.meta.page }}
            are still displayed.
          </p>

          <p v-else-if="isWaypointsPaused" role="status" class="text-sm text-muted-foreground">
            Waypoint refresh is waiting for a connection.
          </p>

          <p v-else-if="isWaypointsFetching" role="status" class="text-sm text-muted-foreground">
            Updating waypoints…
          </p>

          <WaypointList
            :response="waypoints"
            :page="search.page"
            :limit="search.limit"
            :marketplace-only="search.marketplace"
            :is-fetching="isWaypointsFetching"
            :is-placeholder-data="isPlaceholderData"
            @change-page="changeWaypointPage"
            @change-limit="changeWaypointLimit"
            @change-marketplace="changeMarketplace"
          />
        </template>

        <FeedbackState
          v-else-if="waypointsError"
          kind="error"
          title="Unable to load waypoints"
          :description="waypointsError.message"
        >
          <AppButton
            variant="outline"
            :loading="isWaypointsFetching"
            :disabled="isWaypointsPaused"
            loading-label="Trying again…"
            @click="refetchWaypoints()"
          >
            Try again
          </AppButton>
        </FeedbackState>
      </section>
    </template>

    <FeedbackState
      v-else-if="systemError"
      kind="error"
      :title="isSystemNotFound ? 'System not found' : 'Unable to load system'"
      :description="
        isSystemNotFound
          ? 'This system could not be found. Return to the systems list to select another system.'
          : systemError.message
      "
    >
      <AppButton
        v-if="!isSystemNotFound"
        :loading="isSystemFetching"
        :disabled="isSystemPaused"
        loading-label="Retrying…"
        @click="refetchSystem()"
      >
        Try again
      </AppButton>
    </FeedbackState>
  </section>
</template>
