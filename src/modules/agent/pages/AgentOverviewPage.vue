<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'
import { formatNumber } from '@/shared/utils/formatters'
import { getSystemSymbolFromWaypointSymbol } from '@/shared/utils/space-symbols'

import { useAgentQuery } from '../composables/use-agent-query'

const { data: agent, error, isPending, isFetching, isPaused, refetch } = useAgentQuery()

const headquartersSystemSymbol = computed(() =>
  agent.value ? getSystemSymbolFromWaypointSymbol(agent.value.headquarters) : undefined,
)
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-xl font-semibold tracking-tight">Agent overview</h1>

        <p class="mt-1 text-sm text-muted-foreground">
          Current resources and operational identity.
        </p>
      </div>

      <AppButton
        v-if="agent"
        variant="outline"
        class="h-8 px-3 text-xs"
        :loading="isFetching"
        :disabled="isPaused"
        loading-label="Refreshing…"
        @click="refetch()"
      >
        Refresh
      </AppButton>
    </header>

    <FeedbackState
      v-if="isPending"
      kind="loading"
      :title="isPaused ? 'Waiting for a connection' : 'Loading your agent'"
      :description="
        isPaused
          ? 'The request will resume when your connection returns.'
          : 'Retrieving your current agent information.'
      "
    />

    <template v-else-if="agent">
      <div
        v-if="error"
        role="alert"
        class="border border-warning/30 bg-warning-subtle p-4 text-sm text-warning"
      >
        <p class="font-medium">Agent information could not be refreshed.</p>

        <p class="mt-1">
          {{ error.message }}
        </p>

        <p class="mt-1">Previously loaded information remains visible and may be outdated.</p>
      </div>

      <p v-if="isPaused" role="status" class="text-sm text-muted-foreground">
        Refresh is waiting for a connection. Previously loaded information remains visible.
      </p>

      <p v-else-if="isFetching" role="status" class="text-sm text-muted-foreground">
        Updating agent information…
      </p>

      <div :aria-busy="isFetching" class="space-y-4">
        <!-- Agent identity -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
          <div class="flex min-w-0 items-center gap-3">
            <span class="size-2 shrink-0 rounded-full bg-signal" aria-hidden="true" />

            <div class="min-w-0">
              <p
                class="truncate font-mono text-sm font-medium text-foreground"
                :title="agent.symbol"
              >
                {{ agent.symbol }}
              </p>

              <p class="mt-0.5 text-xs text-muted-foreground">Active agent</p>
            </div>
          </div>

          <div class="text-right">
            <p class="text-xs text-muted-foreground">Starting faction</p>

            <p class="mt-0.5 font-mono text-sm text-foreground">
              {{ agent.startingFaction }}
            </p>
          </div>
        </div>

        <!-- Instrument panel -->
        <dl
          class="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
        >
          <div class="bg-card p-5">
            <dt class="text-xs text-muted-foreground">Credits</dt>

            <dd class="mt-3 font-mono text-2xl font-medium tabular-nums text-signal">
              {{ formatNumber(agent.credits) }}
              <span class="text-sm text-muted-foreground"> CR </span>
            </dd>
          </div>

          <div class="bg-card p-5">
            <dt class="text-xs text-muted-foreground">Ships</dt>

            <dd class="mt-3 font-mono text-2xl font-medium tabular-nums">
              <RouterLink
                :to="{ name: routeNames.fleet }"
                aria-label="Open fleet"
                class="rounded-sm underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {{ formatNumber(agent.shipCount) }}
              </RouterLink>
            </dd>
          </div>

          <div class="bg-card p-5">
            <dt class="text-xs text-muted-foreground">Faction</dt>

            <dd class="mt-3 font-mono text-xl font-medium">
              {{ agent.startingFaction }}
            </dd>
          </div>

          <div class="min-w-0 bg-card p-5">
            <dt class="text-xs text-muted-foreground">Headquarters</dt>

            <dd class="mt-3 min-w-0 font-mono text-base font-medium">
              <RouterLink
                v-if="headquartersSystemSymbol"
                :to="{
                  name: routeNames.waypointDetail,
                  params: {
                    systemSymbol: headquartersSystemSymbol,
                    waypointSymbol: agent.headquarters,
                  },
                }"
                :aria-label="`Open headquarters ${agent.headquarters}`"
                class="block truncate rounded-sm underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                :title="agent.headquarters"
              >
                {{ agent.headquarters }}
              </RouterLink>

              <span v-else class="block truncate" :title="agent.headquarters">
                {{ agent.headquarters }}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </template>

    <FeedbackState
      v-else-if="error"
      kind="error"
      title="Unable to load your agent"
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
    </FeedbackState>
  </section>
</template>
