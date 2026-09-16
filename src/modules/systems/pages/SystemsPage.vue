<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'
import { Label } from '@/shared/components/ui/label'

import SystemCard from '../components/SystemCard.vue'
import { useSystemsQuery } from '../composables/use-systems-query'
import {
  systemsPageSizes,
  systemsParamsSchema,
  systemsSearchSchema,
  type SystemsParams,
} from '../schemas/systems.schema'

const route = useRoute()
const router = useRouter()

const params = computed(() => systemsSearchSchema.parse(route.query))

const {
  data: systems,
  error,
  isPending,
  isFetching,
  isPaused,
  isPlaceholderData,
  refetch,
} = useSystemsQuery(params)

const totalPages = computed(() => {
  if (!systems.value) return 1

  return Math.max(1, Math.ceil(systems.value.meta.total / systems.value.meta.limit))
})

const canGoPrevious = computed(() => params.value.page > 1)
const canGoNext = computed(() => params.value.page < totalPages.value)

async function replacePagination(next: SystemsParams) {
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

  const parsed = systemsParamsSchema.safeParse({
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

  const parsed = systemsParamsSchema.safeParse({
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
        <p class="text-sm font-medium text-primary">Exploration</p>

        <h1 class="mt-2 text-3xl font-bold tracking-tight">Systems</h1>

        <p class="mt-2 text-muted-foreground">
          Explore known star systems, their coordinates and waypoints.
        </p>
      </div>

      <AppButton
        variant="outline"
        aria-label="Refresh systems"
        :loading="isFetching"
        :disabled="isPaused"
        loading-label="Refreshing…"
        @click="refetch()"
      >
        Refresh systems
      </AppButton>
    </header>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <p class="text-sm text-muted-foreground">
        <template v-if="systems">
          {{ systems.meta.total }}
          {{ systems.meta.total === 1 ? 'system' : 'systems' }}
          known
        </template>
      </p>

      <div class="flex items-center gap-3">
        <Label for="systems-limit"> Systems per page </Label>

        <select
          id="systems-limit"
          :value="params.limit"
          :disabled="isFetching"
          class="h-10 rounded-md border border-input bg-background px-3 text-sm"
          @change="changeLimit"
        >
          <option v-for="size in systemsPageSizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
    </div>

    <FeedbackState
      v-if="isPending"
      kind="loading"
      :title="isPaused ? 'Waiting for a connection' : 'Loading systems'"
      :description="
        isPaused
          ? 'The request will resume when your connection returns.'
          : 'Retrieving known star systems.'
      "
    />

    <template v-else-if="systems">
      <div
        v-if="error"
        role="alert"
        class="rounded-lg border border-warning/30 bg-warning-subtle p-4 text-sm text-warning"
      >
        <p class="font-semibold">Could not refresh systems</p>

        <p class="mt-1">
          {{ error.message }}
        </p>

        <p class="mt-1">Previously loaded information remains visible and may be outdated.</p>
      </div>

      <p v-if="isPlaceholderData" role="status" class="text-sm text-muted-foreground">
        {{
          isPaused
            ? `Waiting for a connection to load page ${params.page}.`
            : `Loading page ${params.page}.`
        }}

        Results from page {{ systems.meta.page }} are still displayed.
      </p>

      <p v-else-if="isPaused" role="status" class="text-sm text-muted-foreground">
        Refresh is waiting for a connection.
      </p>

      <p v-else-if="isFetching" role="status" class="text-sm text-muted-foreground">
        Updating systems…
      </p>

      <div
        v-if="systems.data.length"
        :aria-busy="isFetching"
        class="grid gap-5 md:grid-cols-2"
        :class="{ 'opacity-60': isPlaceholderData }"
      >
        <SystemCard v-for="system in systems.data" :key="system.symbol" :system="system" />
      </div>

      <FeedbackState
        v-else
        kind="empty"
        :title="systems.meta.total === 0 ? 'No systems available' : 'No systems on this page'"
        :description="
          systems.meta.total === 0
            ? 'SpaceTraders did not return any known systems.'
            : 'Return to the first page to view known systems.'
        "
      >
        <AppButton
          v-if="params.page > 1"
          variant="outline"
          aria-label="Return to first systems page"
          :disabled="isFetching"
          @click="changePage(1)"
        >
          Return to first page
        </AppButton>
      </FeedbackState>

      <nav
        v-if="systems.meta.total > 0"
        aria-label="Systems pagination"
        class="flex flex-wrap items-center justify-between gap-4 pt-5"
      >
        <AppButton
          variant="outline"
          aria-label="Previous systems page"
          :disabled="!canGoPrevious || isFetching || isPlaceholderData"
          @click="changePage(params.page - 1)"
        >
          Previous
        </AppButton>

        <p class="text-sm text-muted-foreground">
          <template v-if="systems.meta.page <= totalPages">
            Page {{ systems.meta.page }} of {{ totalPages }}
          </template>

          <template v-else>
            Requested page {{ params.page }} is outside the available range.
          </template>
        </p>

        <AppButton
          variant="outline"
          aria-label="Next systems page"
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
      title="Unable to load systems"
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
        aria-label="Return to first systems page"
        :disabled="isFetching"
        @click="changePage(1)"
      >
        Return to first page
      </AppButton>
    </FeedbackState>
  </section>
</template>
