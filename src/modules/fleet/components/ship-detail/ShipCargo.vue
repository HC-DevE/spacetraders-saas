<script setup lang="ts">
import { formatNumber } from '@/shared/utils/formatters'

import type { Ship } from '../../schemas/ship.schema'

defineProps<{
  cargo: Ship['cargo']
  shipSymbol: string
}>()
</script>

<template>
  <section class="min-w-0 border border-border bg-card text-card-foreground">
    <header
      class="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4"
    >
      <div>
        <h2 class="text-base font-semibold">Cargo inventory</h2>

        <p class="mt-1 text-sm text-muted-foreground">Resources currently stored on board.</p>
      </div>

      <p class="font-mono text-sm tabular-nums text-muted-foreground">
        <span class="text-foreground">
          {{ formatNumber(cargo.units) }}
        </span>
        /
        {{ formatNumber(cargo.capacity) }}
        units
      </p>
    </header>

    <div v-if="cargo.inventory.length" class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <caption class="sr-only">
          Resources carried by
          {{
            shipSymbol
          }}
        </caption>

        <thead class="border-b border-border bg-background text-xs text-muted-foreground">
          <tr>
            <th scope="col" class="px-5 py-3 font-medium">Resource</th>

            <th scope="col" class="px-5 py-3 text-right font-medium">Units</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-border">
          <tr
            v-for="item in cargo.inventory"
            :key="item.symbol"
            class="transition-colors hover:bg-background"
          >
            <th scope="row" class="px-5 py-4 font-normal">
              <p class="font-medium text-foreground">
                {{ item.name }}
              </p>

              <p class="mt-1 font-mono text-xs text-muted-foreground">
                {{ item.symbol }}
              </p>

              <p class="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {{ item.description }}
              </p>
            </th>

            <td class="px-5 py-4 text-right align-top font-mono font-medium tabular-nums">
              {{ formatNumber(item.units) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="bg-background px-5 py-5">
      <p class="text-sm font-medium">
        {{ cargo.capacity === 0 ? 'No cargo hold' : 'Cargo hold is empty' }}
      </p>

      <p class="mt-1 text-sm text-muted-foreground">
        {{
          cargo.capacity === 0
            ? 'This ship currently has no cargo capacity.'
            : 'This ship is not carrying any resources.'
        }}
      </p>
    </div>
  </section>
</template>
