<script setup lang="ts">
import { formatLabel, formatNumber } from '@/shared/utils/formatters'

import type { Ship } from '../../schemas/ship.schema'

defineProps<{
  modules: Ship['modules']
}>()
</script>

<template>
  <section aria-label="Modules" class="min-w-0 space-y-4 wrap-anywhere">
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold">Modules</h2>

        <p class="mt-1 text-sm text-muted-foreground">Installed internal capabilities.</p>
      </div>

      <p class="font-mono text-xs text-muted-foreground">{{ modules.length }} installed</p>
    </header>

    <ul v-if="modules.length" class="grid gap-4 lg:grid-cols-2">
      <li
        v-for="(module, index) in modules"
        :key="`${module.symbol}-${index}`"
        class="flex min-w-0 flex-col border border-border bg-card p-5"
      >
        <div>
          <h3 class="font-medium text-foreground">
            {{ module.name || formatLabel(module.symbol) }}
          </h3>

          <p v-if="module.description" class="mt-2 text-sm leading-6 text-muted-foreground">
            {{ module.description }}
          </p>
        </div>

        <dl
          v-if="module.capacity !== undefined || module.range !== undefined"
          class="mt-5 flex flex-wrap gap-x-8 gap-y-4"
        >
          <div v-if="module.capacity !== undefined">
            <dt class="text-xs text-muted-foreground">Capacity</dt>

            <dd class="mt-1 font-mono text-base font-medium tabular-nums">
              {{ formatNumber(module.capacity) }}
            </dd>
          </div>

          <div v-if="module.range !== undefined">
            <dt class="text-xs text-muted-foreground">Range</dt>

            <dd class="mt-1 font-mono text-base font-medium tabular-nums">
              {{ formatNumber(module.range) }}
            </dd>
          </div>
        </dl>

        <div class="mt-6">
          <p class="text-xs font-medium text-muted-foreground">Requirements</p>

          <dl
            v-if="
              module.requirements.power !== undefined ||
              module.requirements.crew !== undefined ||
              module.requirements.slots !== undefined
            "
            class="mt-3 flex flex-wrap gap-x-6 gap-y-3"
          >
            <div v-if="module.requirements.power !== undefined">
              <dt class="text-xs text-muted-foreground">Power</dt>

              <dd class="mt-1 font-mono text-sm">
                {{ formatNumber(module.requirements.power) }}
              </dd>
            </div>

            <div v-if="module.requirements.crew !== undefined">
              <dt class="text-xs text-muted-foreground">Crew</dt>

              <dd class="mt-1 font-mono text-sm">
                {{ formatNumber(module.requirements.crew) }}
              </dd>
            </div>

            <div v-if="module.requirements.slots !== undefined">
              <dt class="text-xs text-muted-foreground">Slots</dt>

              <dd class="mt-1 font-mono text-sm">
                {{ formatNumber(module.requirements.slots) }}
              </dd>
            </div>
          </dl>

          <p v-else class="mt-2 text-sm text-muted-foreground">No requirements specified.</p>
        </div>
      </li>
    </ul>

    <p v-else class="border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
      No modules installed.
    </p>
  </section>
</template>
