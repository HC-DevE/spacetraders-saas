<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'
import { Label } from '@/shared/components/ui/label'

import ShipCard from '../components/ShipCard.vue'
import { useShipsQuery } from '../composables/use-ships-query'
import {
  shipsPageSizes,
  shipsParamsSchema,
  shipsSearchSchema,
  type ShipsParams,
} from '../schemas/ships.schema'

const route = useRoute()
const router = useRouter()

const params = computed(() => shipsSearchSchema.parse(route.query))

const {
  data: ships,
  error,
  isPending,
  isFetching,
  isPaused,
  isPlaceholderData,
  refetch,
} = useShipsQuery(params)

const totalPages = computed(() => {
  if (!ships.value) return 1

  return Math.max(1, Math.ceil(ships.value.meta.total / ships.value.meta.limit))
})

const canGoPrevious = computed(() => params.value.page > 1)
const canGoNext = computed(() => params.value.page < totalPages.value)

async function replacePagination(next: ShipsParams) {
  await router.replace({
    query: {
      ...route.query,
      page: String(next.page),
      limit: String(next.limit),
    },
  })
}

async function changePage(nextPage: number) {
  if (isFetching.value) return

  const parsed = shipsParamsSchema.safeParse({
    page: nextPage,
    limit: params.value.limit,
  })

  if (!parsed.success) return

  await replacePagination(parsed.data)
}

async function changeLimit(event: Event) {
  if (!(event.target instanceof HTMLSelectElement) || isFetching.value) {
    return
  }

  const parsed = shipsParamsSchema.safeParse({
    page: 1,
    limit: Number(event.target.value),
  })

  if (!parsed.success) return

  await replacePagination(parsed.data)
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-primary">Operations</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight">Fleet</h1>
        <p class="mt-2 text-muted-foreground">Monitor your ships, locations, fuel and cargo.</p>
      </div>

      <AppButton
        variant="outline"
        aria-label="Refresh ships"
        :loading="isFetching"
        :disabled="isPaused"
        loading-label="Refreshing…"
        @click="refetch()"
      >
        Refresh ships
      </AppButton>
    </header>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <p class="text-sm text-muted-foreground">
        <template v-if="ships">
          {{ ships.meta.total }}
          {{ ships.meta.total === 1 ? 'ship' : 'ships' }} in your fleet
        </template>
      </p>

      <div class="flex items-center gap-3">
        <Label for="ships-limit">Ships per page</Label>

        <select
          id="ships-limit"
          :value="params.limit"
          :disabled="isFetching"
          class="h-10 rounded-md border border-input bg-background px-3 text-sm"
          @change="changeLimit"
        >
          <option v-for="size in shipsPageSizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
    </div>

    <FeedbackState
      v-if="isPending"
      kind="loading"
      :title="isPaused ? 'Waiting for a connection' : 'Loading ships'"
      :description="
        isPaused
          ? 'The request will resume when your connection returns.'
          : 'Retrieving your ships.'
      "
    />

    <template v-else-if="ships">
      <div
        v-if="error"
        role="alert"
        class="rounded-lg border border-warning/30 bg-warning-subtle p-4 text-sm text-warning"
      >
        <p class="font-semibold">Could not refresh ships</p>
        <p class="mt-1">{{ error.message }}</p>
        <p class="mt-1">Previously loaded information remains visible and may be outdated.</p>
      </div>

      <p v-if="isPlaceholderData" role="status" class="text-sm text-muted-foreground">
        {{
          isPaused
            ? `Waiting for a connection to load page ${params.page}.`
            : `Loading page ${params.page}.`
        }}
        Results from page {{ ships.meta.page }} are still displayed.
      </p>

      <p v-else-if="isPaused" role="status" class="text-sm text-muted-foreground">
        Refresh is waiting for a connection.
      </p>

      <p v-else-if="isFetching" role="status" class="text-sm text-muted-foreground">
        Updating your ships…
      </p>

      <div
        v-if="ships.data.length"
        :aria-busy="isFetching"
        class="grid gap-5 md:grid-cols-2"
        :class="{ 'opacity-60': isPlaceholderData }"
      >
        <ShipCard v-for="ship in ships.data" :key="ship.symbol" :ship="ship" />
      </div>

      <FeedbackState
        v-else
        kind="empty"
        :title="ships.meta.total === 0 ? 'No ships yet' : 'No ships on this page'"
        :description="
          ships.meta.total === 0
            ? 'Your agent does not currently own any ships.'
            : 'Return to the first page to view your ships.'
        "
      >
        <AppButton
          v-if="params.page > 1"
          variant="outline"
          aria-label="Return to first ships page"
          :disabled="isFetching"
          @click="changePage(1)"
        >
          Return to first page
        </AppButton>
      </FeedbackState>

      <nav
        v-if="ships.meta.total > 0"
        aria-label="Fleet pagination"
        class="flex flex-wrap items-center justify-between gap-4 pt-5"
      >
        <AppButton
          variant="outline"
          aria-label="Previous ships page"
          :disabled="!canGoPrevious || isFetching || isPlaceholderData"
          @click="changePage(params.page - 1)"
        >
          Previous
        </AppButton>

        <p class="text-sm text-muted-foreground">
          <template v-if="ships.meta.page <= totalPages">
            Page {{ ships.meta.page }} of {{ totalPages }}
          </template>
          <template v-else>
            Requested page {{ params.page }} is outside the available range.
          </template>
        </p>

        <AppButton
          variant="outline"
          aria-label="Next ships page"
          :disabled="!canGoNext || isFetching || isPlaceholderData"
          @click="changePage(params.page + 1)"
        >
          Next
        </AppButton>
      </nav>
    </template>

    <FeedbackState
      v-else-if="error"
      kind="error"
      title="Unable to load ships"
      :description="error.message"
    >
      <AppButton
        variant="outline"
        :loading="isFetching"
        :disabled="isPaused"
        loading-label="Trying again…"
        @click="refetch()"
      >
        Try again
      </AppButton>

      <AppButton
        v-if="params.page > 1"
        variant="ghost"
        aria-label="Return to first ships page"
        :disabled="isFetching"
        @click="changePage(1)"
      >
        Return to first page
      </AppButton>
    </FeedbackState>
  </section>
</template>
