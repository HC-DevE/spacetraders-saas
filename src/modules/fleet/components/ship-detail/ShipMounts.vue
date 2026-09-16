<script setup lang="ts">
import { formatLabel, formatNumber } from '@/shared/utils/formatters'
import type { Ship } from '../../schemas/ship.schema'

defineProps<{ mounts: Ship['mounts'] }>()
</script>

<template>
  <section aria-label="Mounts" class="min-w-0 space-y-4 wrap-anywhere">
    <header>
      <h2 class="text-lg font-semibold">
        Mounts
        <span class="ml-1 text-sm font-normal text-muted-foreground"> ({{ mounts.length }}) </span>
      </h2>

      <p class="mt-1 text-sm text-muted-foreground">Installed external equipment.</p>
    </header>

    <ul v-if="mounts.length" class="grid gap-4 lg:grid-cols-2">
      <li
        v-for="(mount, index) in mounts"
        :key="`${mount.symbol}-${index}`"
        class="grid min-w-0 content-start gap-5 rounded-xl border bg-card p-5 text-card-foreground shadow-sm lg:row-span-3 lg:grid-rows-subgrid"
      >
        <header>
          <h3 class="font-semibold">
            {{ mount.name || formatLabel(mount.symbol) }}
          </h3>

          <p v-if="mount.description" class="mt-2 text-sm leading-6 text-muted-foreground">
            {{ mount.description }}
          </p>
        </header>

        <div class="rounded-lg bg-muted p-4">
          <dl v-if="mount.strength !== undefined">
            <dt class="text-xs text-muted-foreground">Strength</dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums">
              {{ formatNumber(mount.strength) }}
            </dd>
          </dl>

          <p v-else class="text-sm text-muted-foreground">No strength reported.</p>
        </div>

        <div class="border-t pt-4">
          <h4 class="text-sm font-medium">Requirements</h4>

          <dl
            v-if="
              mount.requirements.power !== undefined ||
              mount.requirements.crew !== undefined ||
              mount.requirements.slots !== undefined
            "
            class="mt-3 grid grid-cols-3 gap-4"
          >
            <div v-if="mount.requirements.power !== undefined" class="min-w-0">
              <dt class="text-xs text-muted-foreground">Power</dt>
              <dd class="mt-1 font-semibold tabular-nums">
                {{ formatNumber(mount.requirements.power) }}
              </dd>
            </div>

            <div v-if="mount.requirements.crew !== undefined" class="min-w-0">
              <dt class="text-xs text-muted-foreground">Crew</dt>
              <dd class="mt-1 font-semibold tabular-nums">
                {{ formatNumber(mount.requirements.crew) }}
              </dd>
            </div>

            <div v-if="mount.requirements.slots !== undefined" class="min-w-0">
              <dt class="text-xs text-muted-foreground">Slots</dt>
              <dd class="mt-1 font-semibold tabular-nums">
                {{ formatNumber(mount.requirements.slots) }}
              </dd>
            </div>
          </dl>

          <p v-else class="mt-2 text-sm text-muted-foreground">No requirements specified.</p>

          <div v-if="mount.deposits?.length" class="mt-4 border-t pt-4">
            <h4 class="text-sm font-medium">Supported deposits</h4>

            <ul
              aria-label="Supported deposits"
              role="list"
              class="mt-3 flex flex-wrap items-start gap-2"
            >
              <li
                v-for="(deposit, depositIndex) in mount.deposits"
                :key="`${deposit}-${depositIndex}`"
                class="inline-flex min-w-0 max-w-full rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium leading-5 text-foreground capitalize wrap-anywhere"
              >
                {{ formatLabel(deposit) }}
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>

    <p v-else class="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
      No mounts installed.
    </p>
  </section>
</template>
