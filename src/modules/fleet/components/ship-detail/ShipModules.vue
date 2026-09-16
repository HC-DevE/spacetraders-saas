<script setup lang="ts">
import { formatLabel, formatNumber } from '@/shared/utils/formatters'
import type { Ship } from '../../schemas/ship.schema'

defineProps<{ modules: Ship['modules'] }>()
</script>

<template>
  <section aria-label="Modules" class="min-w-0 space-y-4 wrap-anywhere">
    <header>
      <h2 class="text-lg font-semibold">
        Modules
        <span class="ml-1 text-sm font-normal text-muted-foreground">({{ modules.length }})</span>
      </h2>
      <p class="mt-1 text-sm text-muted-foreground">Installed internal capabilities.</p>
    </header>

    <ul v-if="modules.length" class="grid gap-4 lg:grid-cols-2">
      <li
        v-for="(module, index) in modules"
        :key="`${module.symbol}-${index}`"
        class="grid min-w-0 content-start gap-5 rounded-xl border bg-card p-5 text-card-foreground shadow-sm lg:row-span-3 lg:grid-rows-subgrid"
      >
        <header>
          <h3 class="font-semibold">{{ module.name || formatLabel(module.symbol) }}</h3>
          <p v-if="module.description" class="mt-2 text-sm leading-6 text-muted-foreground">
            {{ module.description }}
          </p>
        </header>

        <div class="rounded-lg bg-muted p-4">
          <dl
            v-if="module.capacity !== undefined || module.range !== undefined"
            class="grid grid-cols-2 gap-4"
          >
            <div v-if="module.capacity !== undefined" class="min-w-0">
              <dt class="text-xs text-muted-foreground">Capacity</dt>
              <dd class="mt-1 text-lg font-semibold tabular-nums">
                {{ formatNumber(module.capacity) }}
              </dd>
            </div>
            <div v-if="module.range !== undefined" class="min-w-0">
              <dt class="text-xs text-muted-foreground">Range</dt>
              <dd class="mt-1 text-lg font-semibold tabular-nums">
                {{ formatNumber(module.range) }}
              </dd>
            </div>
          </dl>
          <p v-else class="text-sm text-muted-foreground">No capacity or range reported.</p>
        </div>

        <div class="border-t pt-4">
          <h4 class="text-sm font-medium">Requirements</h4>
          <dl
            v-if="
              module.requirements.power !== undefined ||
              module.requirements.crew !== undefined ||
              module.requirements.slots !== undefined
            "
            class="mt-3 grid grid-cols-3 gap-4"
          >
            <div v-if="module.requirements.power !== undefined" class="min-w-0">
              <dt class="text-xs text-muted-foreground">Power</dt>
              <dd class="mt-1 font-semibold tabular-nums">
                {{ formatNumber(module.requirements.power) }}
              </dd>
            </div>
            <div v-if="module.requirements.crew !== undefined" class="min-w-0">
              <dt class="text-xs text-muted-foreground">Crew</dt>
              <dd class="mt-1 font-semibold tabular-nums">
                {{ formatNumber(module.requirements.crew) }}
              </dd>
            </div>
            <div v-if="module.requirements.slots !== undefined" class="min-w-0">
              <dt class="text-xs text-muted-foreground">Slots</dt>
              <dd class="mt-1 font-semibold tabular-nums">
                {{ formatNumber(module.requirements.slots) }}
              </dd>
            </div>
          </dl>
          <p v-else class="mt-2 text-sm text-muted-foreground">No requirements specified.</p>
        </div>
      </li>
    </ul>

    <p v-else class="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
      No modules installed.
    </p>
  </section>
</template>
