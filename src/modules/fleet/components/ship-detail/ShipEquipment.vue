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
  <section aria-label="Core equipment" class="min-w-0 space-y-4 wrap-anywhere">
    <header>
      <h2 class="text-lg font-semibold">Core equipment</h2>
      <p class="mt-1 text-sm text-muted-foreground">
        Condition represents repairable wear. Integrity represents permanent wear.
      </p>
    </header>

    <div class="grid gap-4 xl:grid-cols-3">
      <article
        class="grid min-w-0 content-start gap-5 rounded-xl border bg-card p-5 text-card-foreground shadow-sm xl:row-span-4 xl:grid-rows-subgrid"
      >
        <header>
          <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Frame</p>
          <h3 class="mt-2 font-semibold">{{ frame.name }}</h3>
        </header>

        <dl class="grid grid-cols-3 gap-3 rounded-lg bg-muted px-3 py-4 text-center text-sm">
          <div class="min-w-0">
            <dt class="text-muted-foreground">Condition</dt>
            <dd class="mt-2 font-semibold tabular-nums">{{ formatPercentage(frame.condition) }}</dd>
          </div>
          <div class="min-w-0">
            <dt class="text-muted-foreground">Integrity</dt>
            <dd class="mt-2 font-semibold tabular-nums">{{ formatPercentage(frame.integrity) }}</dd>
          </div>
          <div class="min-w-0">
            <dt class="text-muted-foreground">Quality</dt>
            <dd class="mt-2 font-semibold tabular-nums">{{ formatNumber(frame.quality) }}</dd>
          </div>
        </dl>

        <dl class="space-y-3 px-3 text-sm">
          <div class="flex items-baseline justify-between gap-4">
            <dt class="min-w-0 text-muted-foreground">Module slots</dt>
            <dd class="shrink-0 font-semibold tabular-nums">
              {{ formatNumber(frame.moduleSlots) }}
            </dd>
          </div>
          <div class="flex items-baseline justify-between gap-4">
            <dt class="min-w-0 text-muted-foreground">Mounting points</dt>
            <dd class="shrink-0 font-semibold tabular-nums">
              {{ formatNumber(frame.mountingPoints) }}
            </dd>
          </div>
          <div class="flex items-baseline justify-between gap-4">
            <dt class="min-w-0 text-muted-foreground">Base fuel capacity</dt>
            <dd class="shrink-0 font-semibold tabular-nums">
              {{ formatNumber(frame.fuelCapacity) }}
            </dd>
          </div>
        </dl>

        <div class="space-y-3 border-t pt-4 text-sm">
          <p class="leading-6 text-muted-foreground">{{ frame.description }}</p>
          <div>
            <p class="font-medium">Requirements</p>
            <p class="mt-1 text-muted-foreground">{{ formatRequirements(frame.requirements) }}</p>
          </div>
          <p class="text-xs text-muted-foreground">{{ frame.symbol }}</p>
        </div>
      </article>

      <article
        class="grid min-w-0 content-start gap-5 rounded-xl border bg-card p-5 text-card-foreground shadow-sm xl:row-span-4 xl:grid-rows-subgrid"
      >
        <header>
          <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reactor</p>
          <h3 class="mt-2 font-semibold">{{ reactor.name }}</h3>
        </header>

        <dl class="grid grid-cols-3 gap-3 rounded-lg bg-muted px-3 py-4 text-center text-sm">
          <div class="min-w-0">
            <dt class="text-muted-foreground">Condition</dt>
            <dd class="mt-2 font-semibold tabular-nums">
              {{ formatPercentage(reactor.condition) }}
            </dd>
          </div>
          <div class="min-w-0">
            <dt class="text-muted-foreground">Integrity</dt>
            <dd class="mt-2 font-semibold tabular-nums">
              {{ formatPercentage(reactor.integrity) }}
            </dd>
          </div>
          <div class="min-w-0">
            <dt class="text-muted-foreground">Quality</dt>
            <dd class="mt-2 font-semibold tabular-nums">{{ formatNumber(reactor.quality) }}</dd>
          </div>
        </dl>

        <dl class="space-y-3 px-3 text-sm">
          <div class="flex items-baseline justify-between gap-4">
            <dt class="min-w-0 text-muted-foreground">Power output</dt>
            <dd class="shrink-0 font-semibold tabular-nums">
              {{ formatNumber(reactor.powerOutput) }}
            </dd>
          </div>
        </dl>

        <div class="space-y-3 border-t pt-4 text-sm">
          <p class="leading-6 text-muted-foreground">{{ reactor.description }}</p>
          <div>
            <p class="font-medium">Requirements</p>
            <p class="mt-1 text-muted-foreground">{{ formatRequirements(reactor.requirements) }}</p>
          </div>
          <p class="text-xs text-muted-foreground">{{ reactor.symbol }}</p>
        </div>
      </article>

      <article
        class="grid min-w-0 content-start gap-5 rounded-xl border bg-card p-5 text-card-foreground shadow-sm xl:row-span-4 xl:grid-rows-subgrid"
      >
        <header>
          <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Engine</p>
          <h3 class="mt-2 font-semibold">{{ engine.name }}</h3>
        </header>

        <dl class="grid grid-cols-3 gap-3 rounded-lg bg-muted px-3 py-4 text-center text-sm">
          <div class="min-w-0">
            <dt class="text-muted-foreground">Condition</dt>
            <dd class="mt-2 font-semibold tabular-nums">
              {{ formatPercentage(engine.condition) }}
            </dd>
          </div>
          <div class="min-w-0">
            <dt class="text-muted-foreground">Integrity</dt>
            <dd class="mt-2 font-semibold tabular-nums">
              {{ formatPercentage(engine.integrity) }}
            </dd>
          </div>
          <div class="min-w-0">
            <dt class="text-muted-foreground">Quality</dt>
            <dd class="mt-2 font-semibold tabular-nums">{{ formatNumber(engine.quality) }}</dd>
          </div>
        </dl>

        <dl class="space-y-3 px-3 text-sm">
          <div class="flex items-baseline justify-between gap-4">
            <dt class="min-w-0 text-muted-foreground">Speed</dt>
            <dd class="shrink-0 font-semibold tabular-nums">{{ formatNumber(engine.speed) }}</dd>
          </div>
        </dl>

        <div class="space-y-3 border-t pt-4 text-sm">
          <p class="leading-6 text-muted-foreground">{{ engine.description }}</p>
          <div>
            <p class="font-medium">Requirements</p>
            <p class="mt-1 text-muted-foreground">{{ formatRequirements(engine.requirements) }}</p>
          </div>
          <p class="text-xs text-muted-foreground">{{ engine.symbol }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
