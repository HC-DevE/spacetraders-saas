<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { h, ref } from 'vue'

import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'
import DataTable from '@/shared/components/table/DataTable.vue'
import type { DataTableColumnDef } from '@/shared/components/table/data-table'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { formatNumber } from '@/shared/utils/formatters'

type DemoStatus = 'Operational' | 'In transit' | 'Unknown'

type DemoRow = {
  symbol: string
  type: string
  status: DemoStatus
  location: string
  capacity: number
  value: number
}

const agentName = ref('EXPLORER')
const tokenPreview = ref('st-example-agent-token')
const showToken = ref(false)

const palette = [
  {
    name: 'Ink',
    value: '#0c0d10',
    role: 'Application background',
    className: 'bg-ink text-paper',
  },
  {
    name: 'Panel',
    value: '#16181c',
    role: 'Secondary surfaces',
    className: 'bg-panel text-paper',
  },
  {
    name: 'Signal',
    value: '#e8a33d',
    role: 'Live and interactive accent',
    className: 'bg-signal text-ink',
  },
  {
    name: 'Orbit',
    value: '#7c9cb8',
    role: 'Informational state',
    className: 'bg-orbit text-ink',
  },
  {
    name: 'Alert',
    value: '#c1594a',
    role: 'Critical and destructive state',
    className: 'bg-alert text-paper',
  },
  {
    name: 'Paper',
    value: '#e8e6e1',
    role: 'Primary content',
    className: 'bg-paper text-ink',
  },
] as const

const demoRows: DemoRow[] = [
  {
    symbol: 'EXPLORER-1',
    type: 'Command ship',
    status: 'Operational',
    location: 'X1-HZ83-A1',
    capacity: 40,
    value: 125_000,
  },
  {
    symbol: 'EXPLORER-2',
    type: 'Survey probe',
    status: 'In transit',
    location: 'X1-HZ83-B4',
    capacity: 0,
    value: 48_500,
  },
  {
    symbol: 'EXPLORER-3',
    type: 'Light hauler',
    status: 'Unknown',
    location: 'X1-HZ83-C2',
    capacity: 80,
    value: 212_750,
  },
]

const statusClasses: Record<DemoStatus, string> = {
  Operational: 'text-signal',
  'In transit': 'text-orbit',
  Unknown: 'text-muted-foreground',
}

const demoColumns: DataTableColumnDef<DemoRow>[] = [
  {
    accessorKey: 'symbol',
    header: 'Asset',

    meta: {
      className: 'w-56',
      headerClassName: 'sticky left-0 z-20 border-r border-border bg-background',
      cellClassName:
        'sticky left-0 z-10 border-r border-border bg-card transition-colors group-hover:bg-background',
    },

    cell: ({ row }) =>
      h(
        'div',
        {
          class: 'min-w-0',
        },
        [
          h(
            'p',
            {
              class: 'truncate font-mono text-sm font-medium text-foreground',
            },
            row.original.symbol,
          ),

          h(
            'p',
            {
              class: 'mt-1 truncate text-xs text-muted-foreground',
            },
            row.original.type,
          ),
        ],
      ),
  },

  {
    accessorKey: 'status',
    header: 'Status',

    meta: {
      className: 'w-36',
    },

    cell: ({ row }) => {
      const status = row.original.status

      return h(
        'span',
        {
          class: ['inline-flex items-center gap-2 text-sm font-medium', statusClasses[status]],
        },
        [
          h('span', {
            class: 'size-1.5 shrink-0 rounded-full bg-current',
            'aria-hidden': 'true',
          }),

          status,
        ],
      )
    },
  },

  {
    accessorKey: 'location',
    header: 'Location',

    meta: {
      className: 'w-44',
      cellClassName: 'font-mono text-xs text-muted-foreground',
    },
  },

  {
    accessorKey: 'capacity',
    header: 'Capacity',

    meta: {
      align: 'right',
      className: 'w-28',
      cellClassName: 'font-mono tabular-nums',
    },

    cell: ({ row }) => formatNumber(row.original.capacity),
  },

  {
    accessorKey: 'value',
    header: 'Value',

    meta: {
      align: 'right',
      className: 'w-32',
      cellClassName: 'font-mono font-medium tabular-nums',
    },

    cell: ({ row }) => formatNumber(row.original.value),
  },
]
</script>

<template>
  <main class="min-h-screen bg-background text-foreground">
    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header class="max-w-3xl">
        <p class="text-xs font-medium uppercase tracking-[0.18em] text-signal">
          Development reference
        </p>

        <h1 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Design system</h1>

        <p class="mt-4 max-w-2xl leading-7 text-muted-foreground">
          Reference for the visual language and shared interface primitives used throughout Space
          Control.
        </p>
      </header>

      <div class="mt-12 space-y-12">
        <section aria-labelledby="foundations-title" class="border-t border-border pt-8">
          <div class="max-w-2xl">
            <h2 id="foundations-title" class="text-lg font-semibold">Foundations</h2>

            <p class="mt-1 text-sm leading-6 text-muted-foreground">
              Core colors and typography used by the application.
            </p>
          </div>

          <ul class="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="token in palette" :key="token.name" class="min-w-0 bg-card">
              <div
                class="flex h-16 items-end px-4 py-3"
                :class="token.className"
                aria-hidden="true"
              >
                <span class="font-mono text-xs">
                  {{ token.value }}
                </span>
              </div>

              <div class="p-4">
                <p class="font-medium">
                  {{ token.name }}
                </p>

                <p class="mt-1 text-sm text-muted-foreground">
                  {{ token.role }}
                </p>
              </div>
            </li>
          </ul>

          <div class="mt-6 grid gap-px border border-border bg-border md:grid-cols-2">
            <div class="bg-card p-5">
              <p class="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Interface
              </p>

              <p class="mt-4 text-2xl font-semibold tracking-tight">IBM Plex Sans</p>

              <p class="mt-2 text-sm leading-6 text-muted-foreground">
                Headings, labels, actions, navigation and descriptive content.
              </p>
            </div>

            <div class="bg-card p-5">
              <p class="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Technical data
              </p>

              <p class="mt-4 font-mono text-2xl font-medium">IBM Plex Mono</p>

              <p class="mt-2 font-mono text-sm tabular-nums text-muted-foreground">
                X1-HZ83-A1 · 125,000 · EXPLORER-1
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="actions-title" class="border-t border-border pt-8">
          <div class="max-w-2xl">
            <h2 id="actions-title" class="text-lg font-semibold">Actions</h2>

            <p class="mt-1 text-sm leading-6 text-muted-foreground">
              Existing AppButton variants, sizes and interaction states.
            </p>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <AppButton>Primary</AppButton>
            <AppButton variant="secondary"> Secondary </AppButton>
            <AppButton variant="outline"> Outline </AppButton>
            <AppButton variant="ghost"> Ghost </AppButton>
            <AppButton variant="destructive"> Destructive </AppButton>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <AppButton disabled> Unavailable </AppButton>

            <AppButton loading loading-label="Connecting…"> Connect </AppButton>

            <AppButton variant="outline" size="sm"> Small action </AppButton>
          </div>
        </section>

        <section aria-labelledby="inputs-title" class="border-t border-border pt-8">
          <div class="max-w-2xl">
            <h2 id="inputs-title" class="text-lg font-semibold">Inputs</h2>

            <p class="mt-1 text-sm leading-6 text-muted-foreground">
              Labels, supporting text, validation and token visibility.
            </p>
          </div>

          <div class="mt-6 grid gap-8 lg:grid-cols-2">
            <div class="space-y-2">
              <Label for="design-agent-name"> Agent name </Label>

              <Input
                id="design-agent-name"
                v-model="agentName"
                aria-describedby="design-agent-name-help"
              />

              <p id="design-agent-name-help" class="text-sm text-muted-foreground">
                Standard editable field with supporting information.
              </p>
            </div>

            <div class="space-y-2">
              <Label for="design-token"> Agent token </Label>

              <div class="flex items-center gap-2">
                <Input
                  id="design-token"
                  v-model="tokenPreview"
                  :type="showToken ? 'text' : 'password'"
                  aria-describedby="design-token-help"
                  class="min-w-0 flex-1"
                />

                <AppButton
                  variant="outline"
                  :aria-pressed="showToken"
                  aria-controls="design-token"
                  :aria-label="showToken ? 'Hide example agent token' : 'Show example agent token'"
                  @click="showToken = !showToken"
                >
                  <EyeOff v-if="showToken" class="size-4" aria-hidden="true" />

                  <Eye v-else class="size-4" aria-hidden="true" />

                  {{ showToken ? 'Hide' : 'Show' }}
                </AppButton>
              </div>

              <p id="design-token-help" class="text-sm text-muted-foreground">
                Same visibility pattern used by the login form.
              </p>
            </div>

            <div class="space-y-2">
              <Label for="design-invalid-token"> Invalid field </Label>

              <Input
                id="design-invalid-token"
                type="password"
                model-value="invalid-example"
                readonly
                aria-invalid="true"
                aria-describedby="design-token-error"
              />

              <p id="design-token-error" class="text-sm text-destructive">
                This value could not be verified.
              </p>
            </div>

            <div class="space-y-2">
              <Label for="design-disabled-field"> Disabled field </Label>

              <Input id="design-disabled-field" model-value="Unavailable" disabled />

              <p class="text-sm text-muted-foreground">
                Disabled controls remain identifiable without becoming visually dominant.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="feedback-title" class="border-t border-border pt-8">
          <div class="max-w-2xl">
            <h2 id="feedback-title" class="text-lg font-semibold">Feedback</h2>

            <p class="mt-1 text-sm leading-6 text-muted-foreground">
              Initial states are distinct from secondary refresh states.
            </p>
          </div>

          <div class="mt-6 grid gap-5 lg:grid-cols-3">
            <FeedbackState
              kind="loading"
              title="Loading ships"
              description="Retrieving your ships."
            />

            <FeedbackState
              kind="empty"
              title="No ships yet"
              description="Your agent does not currently own any ships."
            />

            <FeedbackState
              kind="error"
              title="Unable to load the fleet"
              description="The service is temporarily unavailable."
            />
          </div>

          <div class="mt-6 space-y-4">
            <div
              role="alert"
              class="border border-warning/30 bg-warning-subtle p-4 text-sm text-warning"
            >
              <p class="font-medium">Could not refresh ships</p>

              <p class="mt-1">Previously loaded information remains visible and may be outdated.</p>
            </div>

            <p role="status" class="text-sm text-muted-foreground">Updating your ships…</p>
          </div>
        </section>

        <section aria-labelledby="data-display-title" class="border-t border-border pt-8">
          <div class="max-w-2xl">
            <h2 id="data-display-title" class="text-lg font-semibold">Data display</h2>

            <p class="mt-1 text-sm leading-6 text-muted-foreground">
              Shared semantic table rendering with a sticky identity column, technical values and
              numeric alignment.
            </p>
          </div>

          <div class="mt-6">
            <DataTable
              :data="demoRows"
              :columns="demoColumns"
              aria-label="Design system data table"
              min-width="52rem"
            />
          </div>
        </section>

        <section aria-labelledby="structured-surfaces-title" class="border-t border-border pt-8">
          <div class="max-w-2xl">
            <h2 id="structured-surfaces-title" class="text-lg font-semibold">
              Structured surfaces
            </h2>

            <p class="mt-1 text-sm leading-6 text-muted-foreground">
              Comparable metadata uses structured grids while heterogeneous information keeps
              independent surfaces.
            </p>
          </div>

          <dl class="mt-6 grid gap-px border border-border bg-border sm:grid-cols-3">
            <div class="min-w-0 bg-card p-4">
              <dt class="text-xs text-muted-foreground">Type</dt>

              <dd class="mt-1 text-sm font-medium text-orbit">Orbital station</dd>
            </div>

            <div class="min-w-0 bg-card p-4">
              <dt class="text-xs text-muted-foreground">Coordinates</dt>

              <dd class="mt-1 font-mono text-sm font-medium tabular-nums">42, -18</dd>
            </div>

            <div class="min-w-0 bg-card p-4">
              <dt class="text-xs text-muted-foreground">Marketplace</dt>

              <dd class="mt-1 text-sm font-medium text-signal">Available</dd>
            </div>
          </dl>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <article class="border border-signal/40 bg-card p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <h3 class="font-medium">Marketplace</h3>

                <span class="text-xs font-medium text-signal"> Active trait </span>
              </div>

              <p class="mt-3 text-sm leading-6 text-muted-foreground">
                A heterogeneous descriptive item can keep its own surface rather than being forced
                into a table.
              </p>
            </article>

            <article class="border border-warning/30 bg-card p-5">
              <h3 class="font-medium text-warning">Temporary modifier</h3>

              <p class="mt-3 text-sm leading-6 text-muted-foreground">
                Warning styling communicates a temporary condition without turning it into a
                destructive error state.
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
