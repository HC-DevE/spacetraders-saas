<script setup lang="ts">
import { formatNumber } from '@/shared/utils/formatters'

import type { Ship } from '../../schemas/ship.schema'
import { formatPercentage } from '../../utils/ship-formatters'

defineProps<{
  frame: Ship['frame']
  reactor: Ship['reactor']
  engine: Ship['engine']
}>()

function formatRequirements(requirements: Ship['frame']['requirements']): string {
  const values: string[] = []

  if (requirements.power !== undefined) {
    values.push(`${formatNumber(requirements.power)} power`)
  }

  if (requirements.crew !== undefined) {
    values.push(`${formatNumber(requirements.crew)} crew`)
  }

  if (requirements.slots !== undefined) {
    values.push(`${formatNumber(requirements.slots)} module slots`)
  }

  return values.length ? values.join(' · ') : 'No requirements specified'
}
</script>

<template>
  <section aria-label="Core equipment" class="min-w-0 space-y-3 wrap-anywhere">
    <header>
      <h2 class="text-base font-semibold">Core equipment</h2>

      <p class="mt-1 text-sm text-muted-foreground">
        Condition represents repairable wear. Integrity represents permanent wear.
      </p>
    </header>

    <div class="grid gap-px overflow-hidden border border-border bg-border xl:grid-cols-3">
      <!-- Frame -->
      <article class="flex min-w-0 flex-col bg-card">
        <header class="border-b border-border px-5 py-4">
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Frame</p>

          <h3 class="mt-2 font-medium">
            {{ frame.name }}
          </h3>

          <p class="mt-1 font-mono text-xs text-muted-foreground">
            {{ frame.symbol }}
          </p>
        </header>

        <dl class="grid grid-cols-3 gap-px bg-border">
          <div class="bg-card px-3 py-4">
            <dt class="text-xs text-muted-foreground">Condition</dt>

            <dd class="mt-2 font-mono text-lg font-medium tabular-nums">
              {{ formatPercentage(frame.condition) }}
            </dd>
          </div>

          <div class="bg-card px-3 py-4">
            <dt class="text-xs text-muted-foreground">Integrity</dt>

            <dd class="mt-2 font-mono text-lg font-medium tabular-nums">
              {{ formatPercentage(frame.integrity) }}
            </dd>
          </div>

          <div class="bg-card px-3 py-4">
            <dt class="text-xs text-muted-foreground">Quality</dt>

            <dd class="mt-2 font-mono text-lg font-medium tabular-nums">
              {{ formatNumber(frame.quality) }}
            </dd>
          </div>
        </dl>

        <dl class="divide-y divide-border border-t border-border text-sm">
          <div class="flex items-baseline justify-between gap-4 px-5 py-3">
            <dt class="text-muted-foreground">Module slots</dt>

            <dd class="font-mono tabular-nums">
              {{ formatNumber(frame.moduleSlots) }}
            </dd>
          </div>

          <div class="flex items-baseline justify-between gap-4 px-5 py-3">
            <dt class="text-muted-foreground">Mounting points</dt>

            <dd class="font-mono tabular-nums">
              {{ formatNumber(frame.mountingPoints) }}
            </dd>
          </div>

          <div class="flex items-baseline justify-between gap-4 px-5 py-3">
            <dt class="text-muted-foreground">Base fuel capacity</dt>

            <dd class="font-mono tabular-nums">
              {{ formatNumber(frame.fuelCapacity) }}
            </dd>
          </div>
        </dl>

        <div class="mt-auto border-t border-border px-5 py-4 text-sm">
          <p class="leading-6 text-muted-foreground">
            {{ frame.description }}
          </p>

          <p class="mt-4 text-xs text-muted-foreground">Requirements</p>

          <p class="mt-1 font-mono text-xs">
            {{ formatRequirements(frame.requirements) }}
          </p>
        </div>
      </article>

      <!-- Reactor -->
      <article class="flex min-w-0 flex-col bg-card">
        <header class="border-b border-border px-5 py-4">
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reactor</p>

          <h3 class="mt-2 font-medium">
            {{ reactor.name }}
          </h3>

          <p class="mt-1 font-mono text-xs text-muted-foreground">
            {{ reactor.symbol }}
          </p>
        </header>

        <dl class="grid grid-cols-3 gap-px bg-border">
          <div class="bg-card px-3 py-4">
            <dt class="text-xs text-muted-foreground">Condition</dt>

            <dd class="mt-2 font-mono text-lg font-medium tabular-nums">
              {{ formatPercentage(reactor.condition) }}
            </dd>
          </div>

          <div class="bg-card px-3 py-4">
            <dt class="text-xs text-muted-foreground">Integrity</dt>

            <dd class="mt-2 font-mono text-lg font-medium tabular-nums">
              {{ formatPercentage(reactor.integrity) }}
            </dd>
          </div>

          <div class="bg-card px-3 py-4">
            <dt class="text-xs text-muted-foreground">Quality</dt>

            <dd class="mt-2 font-mono text-lg font-medium tabular-nums">
              {{ formatNumber(reactor.quality) }}
            </dd>
          </div>
        </dl>

        <dl class="border-t border-border text-sm">
          <div class="flex items-baseline justify-between gap-4 px-5 py-3">
            <dt class="text-muted-foreground">Power output</dt>

            <dd class="font-mono tabular-nums">
              {{ formatNumber(reactor.powerOutput) }}
            </dd>
          </div>
        </dl>

        <div class="mt-auto border-t border-border px-5 py-4 text-sm">
          <p class="leading-6 text-muted-foreground">
            {{ reactor.description }}
          </p>

          <p class="mt-4 text-xs text-muted-foreground">Requirements</p>

          <p class="mt-1 font-mono text-xs">
            {{ formatRequirements(reactor.requirements) }}
          </p>
        </div>
      </article>

      <!-- Engine -->
      <article class="flex min-w-0 flex-col bg-card">
        <header class="border-b border-border px-5 py-4">
          <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">Engine</p>

          <h3 class="mt-2 font-medium">
            {{ engine.name }}
          </h3>

          <p class="mt-1 font-mono text-xs text-muted-foreground">
            {{ engine.symbol }}
          </p>
        </header>

        <dl class="grid grid-cols-3 gap-px bg-border">
          <div class="bg-card px-3 py-4">
            <dt class="text-xs text-muted-foreground">Condition</dt>

            <dd class="mt-2 font-mono text-lg font-medium tabular-nums">
              {{ formatPercentage(engine.condition) }}
            </dd>
          </div>

          <div class="bg-card px-3 py-4">
            <dt class="text-xs text-muted-foreground">Integrity</dt>

            <dd class="mt-2 font-mono text-lg font-medium tabular-nums">
              {{ formatPercentage(engine.integrity) }}
            </dd>
          </div>

          <div class="bg-card px-3 py-4">
            <dt class="text-xs text-muted-foreground">Quality</dt>

            <dd class="mt-2 font-mono text-lg font-medium tabular-nums">
              {{ formatNumber(engine.quality) }}
            </dd>
          </div>
        </dl>

        <dl class="border-t border-border text-sm">
          <div class="flex items-baseline justify-between gap-4 px-5 py-3">
            <dt class="text-muted-foreground">Speed</dt>

            <dd class="font-mono tabular-nums">
              {{ formatNumber(engine.speed) }}
            </dd>
          </div>
        </dl>

        <div class="mt-auto border-t border-border px-5 py-4 text-sm">
          <p class="leading-6 text-muted-foreground">
            {{ engine.description }}
          </p>

          <p class="mt-4 text-xs text-muted-foreground">Requirements</p>

          <p class="mt-1 font-mono text-xs">
            {{ formatRequirements(engine.requirements) }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
