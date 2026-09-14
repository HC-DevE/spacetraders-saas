<script setup lang="ts">
import { computed, ref } from 'vue'

import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

const scenarios = [
  { value: 'success', label: 'Success' },
  { value: 'loading', label: 'Initial loading' },
  { value: 'empty', label: 'Empty result' },
  { value: 'error', label: 'Initial error' },
  { value: 'refreshing', label: 'Refreshing existing data' },
  { value: 'refresh-error', label: 'Refresh failed' },
] as const

type Scenario = (typeof scenarios)[number]['value']

const scenario = ref<Scenario>('success')
const agentName = ref('EXPLORER')

const isRefreshing = computed(() => scenario.value === 'refreshing')

const ships = [
  {
    symbol: 'EXPLORER-1',
    role: 'Command ship',
    location: 'X1-HZ83-A1',
    fuel: '400 / 400',
    cargo: '0 / 40',
  },
  {
    symbol: 'EXPLORER-2',
    role: 'Survey probe',
    location: 'X1-HZ83-A1',
    fuel: '100 / 100',
    cargo: '0 / 0',
  },
]

function changeScenario(event: Event) {
  if (!(event.target instanceof HTMLSelectElement)) return

  const value = event.target.value
  const selected = scenarios.find((item) => item.value === value)

  if (selected) {
    scenario.value = selected.value
  }
}

function showSuccess() {
  scenario.value = 'success'
}
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b bg-card">
      <div class="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5 sm:px-6">
        <span
          aria-hidden="true"
          class="grid size-10 place-items-center rounded-xl bg-primary font-bold text-primary-foreground"
        >
          S
        </span>

        <div>
          <p class="font-semibold tracking-tight">SpaceTraders</p>
          <p class="text-xs text-muted-foreground">Fleet operations</p>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <div class="max-w-2xl space-y-3">
        <p class="text-sm font-semibold text-primary">Interface foundations</p>

        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Design system</h1>

        <p class="leading-7 text-muted-foreground">
          Shared controls and interface states for the SpaceTraders application. The examples below
          use demonstration data.
        </p>
      </div>

      <section
        aria-labelledby="actions-title"
        class="space-y-6 rounded-xl border bg-card p-5 shadow-sm sm:p-6"
      >
        <div>
          <h2 id="actions-title" class="text-lg font-semibold">Actions</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Visual hierarchy, disabled controls and loading feedback.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <AppButton>Primary</AppButton>
          <AppButton variant="secondary">Secondary</AppButton>
          <AppButton variant="outline">Outline</AppButton>
          <AppButton variant="ghost">Ghost</AppButton>
          <AppButton variant="destructive">Destructive</AppButton>
        </div>

        <div class="flex flex-wrap items-center gap-3 border-t pt-6">
          <AppButton disabled>Unavailable</AppButton>
          <AppButton loading loading-label="Connecting…">Connect</AppButton>
          <AppButton variant="outline" size="sm">Small action</AppButton>
        </div>
      </section>

      <section
        aria-labelledby="fields-title"
        class="space-y-6 rounded-xl border bg-card p-5 shadow-sm sm:p-6"
      >
        <div>
          <h2 id="fields-title" class="text-lg font-semibold">Form fields</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Labels, supporting text and validation feedback.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <div class="space-y-2">
            <Label for="agent-name">Agent name</Label>
            <Input id="agent-name" v-model="agentName" aria-describedby="agent-name-help" />
            <p id="agent-name-help" class="text-sm text-muted-foreground">
              A readable identifier for your agent.
            </p>
          </div>

          <div class="space-y-2">
            <Label for="invalid-token">Agent token — error example</Label>
            <Input
              id="invalid-token"
              type="password"
              model-value="invalid-example"
              readonly
              aria-invalid="true"
              aria-describedby="token-error"
              class="border-destructive"
            />
            <p id="token-error" class="text-sm text-destructive">
              This token could not be verified. Check it and try again.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="states-title"
        class="space-y-6 rounded-xl border bg-card p-5 shadow-sm sm:p-6"
      >
        <div class="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2 id="states-title" class="text-lg font-semibold">Data states</h2>
            <p class="mt-1 text-sm text-muted-foreground">
              Switch scenarios to inspect the fleet preview.
            </p>
          </div>

          <div class="space-y-2">
            <Label for="scenario">Preview state</Label>
            <select
              id="scenario"
              :value="scenario"
              class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              @change="changeScenario"
            >
              <option v-for="item in scenarios" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </div>
        </div>

        <FeedbackState
          v-if="scenario === 'loading'"
          kind="loading"
          title="Loading fleet"
          description="Retrieving your ships."
        />

        <FeedbackState
          v-else-if="scenario === 'error'"
          kind="error"
          title="Unable to load the fleet"
          description="The service is temporarily unavailable."
        >
          <AppButton variant="outline" @click="showSuccess"> Try again </AppButton>
        </FeedbackState>

        <FeedbackState
          v-else-if="scenario === 'empty'"
          kind="empty"
          title="No ships yet"
          description="Your agent does not currently own any ships."
        />

        <div v-else class="space-y-4">
          <div
            v-if="scenario === 'refresh-error'"
            role="alert"
            class="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-warning/30 bg-warning-subtle p-4"
          >
            <div>
              <p class="font-medium text-warning">Refresh failed</p>
              <p class="mt-1 text-sm text-warning">
                Previously loaded ships are still displayed. Their information may be outdated.
              </p>
            </div>

            <AppButton variant="outline" @click="showSuccess"> Retry refresh </AppButton>
          </div>

          <p v-if="isRefreshing" role="status" class="text-sm text-muted-foreground">
            Updating fleet. Previously loaded ships remain visible.
          </p>

          <div :aria-busy="isRefreshing" class="grid gap-4 md:grid-cols-2">
            <article
              v-for="ship in ships"
              :key="ship.symbol"
              class="rounded-xl border bg-background p-5"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 class="font-semibold">{{ ship.symbol }}</h3>
                  <p class="mt-1 text-sm text-muted-foreground">
                    {{ ship.role }}
                  </p>
                </div>

                <span
                  class="rounded-full bg-success-subtle px-2.5 py-1 text-xs font-semibold text-success"
                >
                  Docked
                </span>
              </div>

              <dl class="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div class="col-span-2">
                  <dt class="text-muted-foreground">Location</dt>
                  <dd class="mt-1 font-medium">{{ ship.location }}</dd>
                </div>

                <div>
                  <dt class="text-muted-foreground">Fuel</dt>
                  <dd class="mt-1 font-medium tabular-nums">{{ ship.fuel }}</dd>
                </div>

                <div>
                  <dt class="text-muted-foreground">Cargo</dt>
                  <dd class="mt-1 font-medium tabular-nums">{{ ship.cargo }}</dd>
                </div>
              </dl>
            </article>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
