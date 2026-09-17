<script setup lang="ts">
import { formatLabel, formatNumber } from '@/shared/utils/formatters'

import type { Ship } from '../../schemas/ship.schema'

defineProps<{
  mounts: Ship['mounts']
}>()
</script>

<template>
  <section aria-label="Mounts" class="min-w-0 space-y-4 wrap-anywhere">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold">Mounts</h2>

        <p class="mt-1 text-sm text-muted-foreground">Installed external equipment.</p>
      </div>

      <p class="font-mono text-xs text-muted-foreground">{{ mounts.length }} installed</p>
    </header>

    <ul v-if="mounts.length" class="grid gap-4 lg:grid-cols-2">
      <li
        v-for="(mount, index) in mounts"
        :key="`${mount.symbol}-${index}`"
        class="flex min-w-0 flex-col border border-border bg-card p-5"
      >
        <div>
          <h3 class="font-medium text-foreground">
            {{ mount.name || formatLabel(mount.symbol) }}
          </h3>

          <p v-if="mount.description" class="mt-2 text-sm leading-6 text-muted-foreground">
            {{ mount.description }}
          </p>
        </div>

        <dl v-if="mount.strength !== undefined" class="mt-5">
          <div>
            <dt class="text-xs text-muted-foreground">Strength</dt>

            <dd class="mt-1 font-mono text-base font-medium tabular-nums">
              {{ formatNumber(mount.strength) }}
            </dd>
          </div>
        </dl>

        <div class="mt-6">
          <p class="text-xs font-medium text-muted-foreground">Requirements</p>

          <dl
            v-if="
              mount.requirements.power !== undefined ||
              mount.requirements.crew !== undefined ||
              mount.requirements.slots !== undefined
            "
            class="mt-3 flex flex-wrap gap-x-6 gap-y-3"
          >
            <div v-if="mount.requirements.power !== undefined">
              <dt class="text-xs text-muted-foreground">Power</dt>

              <dd class="mt-1 font-mono text-sm">
                {{ formatNumber(mount.requirements.power) }}
              </dd>
            </div>

            <div v-if="mount.requirements.crew !== undefined">
              <dt class="text-xs text-muted-foreground">Crew</dt>

              <dd class="mt-1 font-mono text-sm">
                {{ formatNumber(mount.requirements.crew) }}
              </dd>
            </div>

            <div v-if="mount.requirements.slots !== undefined">
              <dt class="text-xs text-muted-foreground">Slots</dt>

              <dd class="mt-1 font-mono text-sm">
                {{ formatNumber(mount.requirements.slots) }}
              </dd>
            </div>
          </dl>

          <p v-else class="mt-2 text-sm text-muted-foreground">No requirements specified.</p>
        </div>

        <div v-if="mount.deposits?.length" class="mt-6">
          <p class="text-xs font-medium text-muted-foreground">Supported deposits</p>

          <ul aria-label="Supported deposits" role="list" class="mt-3 flex flex-wrap gap-2">
            <li
              v-for="(deposit, depositIndex) in mount.deposits"
              :key="`${deposit}-${depositIndex}`"
              class="border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-muted-foreground"
            >
              {{ formatLabel(deposit) }}
            </li>
          </ul>
        </div>
      </li>
    </ul>

    <p v-else class="border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
      No mounts installed.
    </p>
  </section>
</template>
