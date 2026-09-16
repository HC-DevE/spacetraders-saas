<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'
import { Label } from '@/shared/components/ui/label'

import { waypointsPageSizes, type WaypointsResponse } from '../schemas/waypoints.schema'
import type { Waypoint } from '../schemas/waypoint.schema'
import { formatLabel } from '@/shared/utils/formatters'
import { routeNames } from '@/app/router/route-names'

const props = defineProps<{
  response: WaypointsResponse
  page: number
  limit: number
  marketplaceOnly: boolean
  isFetching: boolean
  isPlaceholderData: boolean
}>()

const emit = defineEmits<{
  changePage: [page: number]
  changeLimit: [limit: number]
  changeMarketplace: [enabled: boolean]
}>()

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.response.meta.total / props.response.meta.limit)),
)

const canGoPrevious = computed(() => props.page > 1)
const canGoNext = computed(() => props.page < totalPages.value)

function changeLimit(event: Event) {
  if (!(event.target instanceof HTMLSelectElement)) return

  emit('changeLimit', Number(event.target.value))
}

function changeMarketplace(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) return

  emit('changeMarketplace', event.target.checked)
}

const router = useRouter()

function viewWaypoint(waypoint: Waypoint) {
  return router.push({
    name: routeNames.waypointDetail,
    params: {
      systemSymbol: waypoint.systemSymbol,
      waypointSymbol: waypoint.symbol,
    },
  })
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <p class="text-sm text-muted-foreground">
        {{ response.meta.total }}
        {{
          marketplaceOnly
            ? response.meta.total === 1
              ? 'marketplace waypoint'
              : 'marketplace waypoints'
            : response.meta.total === 1
              ? 'waypoint'
              : 'waypoints'
        }}
      </p>

      <div class="flex flex-wrap items-center gap-5">
        <label class="flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            :checked="marketplaceOnly"
            :disabled="isFetching"
            class="size-4 rounded border-input"
            @change="changeMarketplace"
          />

          Marketplace only
        </label>

        <div class="flex items-center gap-3">
          <Label for="waypoints-limit"> Waypoints per page </Label>

          <select
            id="waypoints-limit"
            :value="limit"
            :disabled="isFetching"
            class="h-10 rounded-md border border-input bg-background px-3 text-sm"
            @change="changeLimit"
          >
            <option v-for="size in waypointsPageSizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div
      v-if="response.data.length"
      :aria-busy="isFetching"
      class="grid gap-4 md:grid-cols-2"
      :class="{ 'opacity-60': isPlaceholderData }"
    >
      <article
        v-for="waypoint in response.data"
        :key="waypoint.symbol"
        class="min-w-0 rounded-xl border bg-card p-5 shadow-sm wrap-anywhere"
      >
        <header class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="font-semibold">
              {{ waypoint.symbol }}
            </h3>

            <p class="mt-1 text-sm capitalize text-muted-foreground">
              {{ formatLabel(waypoint.type) }}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <span
              v-if="waypoint.isUnderConstruction"
              class="rounded-full bg-warning-subtle px-2.5 py-1 text-xs font-semibold text-warning"
            >
              Under construction
            </span>

            <AppButton
              type="button"
              variant="secondary"
              size="sm"
              :aria-label="`View waypoint ${waypoint.symbol}`"
              @click="viewWaypoint(waypoint)"
            >
              View details
            </AppButton>
          </div>
        </header>

        <dl class="mt-4 grid gap-3 sm:grid-cols-3">
          <div class="rounded-lg bg-muted p-3">
            <dt class="text-xs text-muted-foreground">Coordinates</dt>

            <dd class="mt-1 text-sm font-semibold tabular-nums">
              {{ waypoint.x }}, {{ waypoint.y }}
            </dd>
          </div>

          <div class="rounded-lg bg-muted p-3">
            <dt class="text-xs text-muted-foreground">Orbitals</dt>

            <dd class="mt-1 text-sm font-semibold tabular-nums">
              {{ waypoint.orbitals.length }}
            </dd>
          </div>

          <div class="rounded-lg bg-muted p-3">
            <dt class="text-xs text-muted-foreground">Faction</dt>

            <dd class="mt-1 text-sm font-semibold">
              {{ waypoint.faction?.symbol || 'None reported' }}
            </dd>
          </div>
        </dl>

        <div class="mt-4 border-t pt-4">
          <h4 class="text-sm font-medium">Traits</h4>

          <ul v-if="waypoint.traits.length" class="mt-3 flex flex-wrap gap-2">
            <li
              v-for="trait in waypoint.traits"
              :key="trait.symbol"
              class="rounded-full border bg-muted px-3 py-1 text-xs font-medium"
              :title="trait.description"
            >
              {{ trait.name }}
            </li>
          </ul>

          <p v-else class="mt-2 text-sm text-muted-foreground">No traits reported.</p>
        </div>
      </article>
    </div>

    <FeedbackState
      v-else
      kind="empty"
      :title="
        marketplaceOnly
          ? 'No marketplace waypoints'
          : response.meta.total === 0
            ? 'No waypoints available'
            : 'No waypoints on this page'
      "
      :description="
        marketplaceOnly
          ? 'No waypoint with a known marketplace was returned for this system.'
          : response.meta.total === 0
            ? 'SpaceTraders did not return any waypoints for this system.'
            : 'Return to the first page to view available waypoints.'
      "
    >
      <AppButton v-if="marketplaceOnly" variant="outline" @click="emit('changeMarketplace', false)">
        Show all waypoints
      </AppButton>

      <AppButton v-else-if="page > 1" variant="outline" @click="emit('changePage', 1)">
        Return to first page
      </AppButton>
    </FeedbackState>

    <nav
      v-if="response.meta.total > 0"
      aria-label="Waypoints pagination"
      class="flex flex-wrap items-center justify-between gap-4 pt-4"
    >
      <AppButton
        variant="outline"
        aria-label="Previous waypoints page"
        :disabled="!canGoPrevious || isFetching || isPlaceholderData"
        @click="emit('changePage', page - 1)"
      >
        Previous
      </AppButton>

      <p class="text-sm text-muted-foreground">
        <template v-if="response.meta.page <= totalPages">
          Page {{ response.meta.page }} of {{ totalPages }}
        </template>

        <template v-else> Requested page {{ page }} is outside the available range. </template>
      </p>

      <AppButton
        variant="outline"
        aria-label="Next waypoints page"
        :disabled="!canGoNext || isFetching || isPlaceholderData"
        @click="emit('changePage', page + 1)"
      >
        Next
      </AppButton>
    </nav>
  </div>
</template>
