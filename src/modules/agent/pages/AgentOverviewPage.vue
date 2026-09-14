<script setup lang="ts">
import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'

import { useAgentQuery } from '../composables/use-agent-query'

const { data: agent, error, isPending, isFetching, isPaused, refetch } = useAgentQuery()

const numberFormatter = new Intl.NumberFormat('en-US')
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-primary">Command center</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight">Agent overview</h1>
        <p class="mt-2 text-muted-foreground">Your identity, resources and headquarters.</p>
      </div>

      <AppButton
        v-if="agent"
        variant="outline"
        :loading="isFetching"
        :disabled="isPaused"
        loading-label="Refreshing…"
        @click="refetch()"
      >
        Refresh agent
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
        class="rounded-lg border border-warning/30 bg-warning-subtle p-4 text-sm text-warning"
      >
        <p class="font-semibold">Agent information could not be refreshed.</p>
        <p class="mt-1">{{ error.message }}</p>
        <p class="mt-1">Previously loaded information remains visible and may be outdated.</p>
      </div>

      <p v-if="isPaused" role="status" class="text-sm text-muted-foreground">
        Refresh is waiting for a connection. Previously loaded information remains visible.
      </p>

      <p v-else-if="isFetching" role="status" class="text-sm text-muted-foreground">
        Updating your agent information…
      </p>

      <div :aria-busy="isFetching" class="space-y-5">
        <section class="rounded-xl border bg-card p-6 shadow-sm">
          <p class="text-sm text-muted-foreground">Agent</p>

          <h2 class="mt-2 wrap-break-word text-2xl font-semibold">
            {{ agent.symbol }}
          </h2>

          <p class="mt-2 text-sm text-muted-foreground">
            Starting faction:
            <span class="font-medium text-foreground">
              {{ agent.startingFaction }}
            </span>
          </p>
        </section>

        <dl class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-xl border bg-card p-6 shadow-sm">
            <dt class="text-sm text-muted-foreground">Available credits</dt>
            <dd class="mt-3 wrap-break-word text-2xl font-semibold tabular-nums">
              {{ numberFormatter.format(agent.credits) }}
            </dd>
          </div>

          <div class="rounded-xl border bg-card p-6 shadow-sm">
            <dt class="text-sm text-muted-foreground">Ships owned</dt>
            <dd class="mt-3 text-2xl font-semibold tabular-nums">
              {{ numberFormatter.format(agent.shipCount) }}
            </dd>
          </div>

          <div class="rounded-xl border bg-card p-6 shadow-sm">
            <dt class="text-sm text-muted-foreground">Headquarters</dt>
            <dd class="mt-3 wrap-break-word text-xl font-semibold">
              {{ agent.headquarters }}
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
