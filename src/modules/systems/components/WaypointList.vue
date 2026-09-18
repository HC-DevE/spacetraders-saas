<script setup lang="ts">
import { computed } from 'vue'

import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'
import { Label } from '@/shared/components/ui/label'

import { waypointsPageSizes, type WaypointsResponse } from '../schemas/waypoints.schema'
import WaypointTable from './WaypointTable.vue'

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
  if (!(event.target instanceof HTMLSelectElement)) {
    return
  }

  emit('changeLimit', Number(event.target.value))
}

function changeMarketplace(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) {
    return
  }

  emit('changeMarketplace', event.target.checked)
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-4 border-y border-border py-3">
      <p class="text-sm text-muted-foreground">
        <span class="font-mono tabular-nums text-foreground">
          {{ response.meta.total }}
        </span>

        {{
          marketplaceOnly
            ? response.meta.total === 1
              ? ' marketplace waypoint'
              : ' marketplace waypoints'
            : response.meta.total === 1
              ? ' waypoint'
              : ' waypoints'
        }}
      </p>

      <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
        <label class="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            :checked="marketplaceOnly"
            :disabled="isFetching"
            class="size-4 accent-primary"
            @change="changeMarketplace"
          />

          <span :class="marketplaceOnly ? 'text-foreground' : ''"> Marketplace only </span>
        </label>

        <div class="flex items-center gap-3">
          <Label for="waypoints-limit" class="text-xs text-muted-foreground">
            Waypoints per page
          </Label>

          <select
            id="waypoints-limit"
            :value="limit"
            :disabled="isFetching"
            class="h-8 border border-input bg-background px-2 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            @change="changeLimit"
          >
            <option v-for="size in waypointsPageSizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <WaypointTable
      v-if="response.data.length"
      :waypoints="response.data"
      :is-fetching="isFetching"
      :is-placeholder-data="isPlaceholderData"
    />

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
      class="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4"
    >
      <AppButton
        variant="outline"
        size="sm"
        aria-label="Previous waypoints page"
        :disabled="!canGoPrevious || isFetching || isPlaceholderData"
        @click="emit('changePage', page - 1)"
      >
        Previous
      </AppButton>

      <p class="font-mono text-xs text-muted-foreground">
        <template v-if="response.meta.page <= totalPages">
          Page
          {{ response.meta.page }}
          /
          {{ totalPages }}
        </template>

        <template v-else>
          Requested page
          {{ page }}
          is outside the available range.
        </template>
      </p>

      <AppButton
        variant="outline"
        size="sm"
        aria-label="Next waypoints page"
        :disabled="!canGoNext || isFetching || isPlaceholderData"
        @click="emit('changePage', page + 1)"
      >
        Next
      </AppButton>
    </nav>
  </div>
</template>
