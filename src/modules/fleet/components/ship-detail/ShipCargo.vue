<script setup lang="ts">
import type { Ship } from '../../schemas/ship.schema'
import { formatNumber } from '../../utils/ship-formatters'

defineProps<{
  cargo: Ship['cargo']
  shipSymbol: string
}>()
</script>

<template>
  <section class="min-w-0 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-lg font-semibold">Cargo inventory</h2>

      <p class="text-sm text-muted-foreground">
        {{ formatNumber(cargo.units) }} / {{ formatNumber(cargo.capacity) }} units
      </p>
    </header>

    <div v-if="cargo.inventory.length" class="mt-5 overflow-x-auto">
      <table class="w-full text-left text-sm">
        <caption class="sr-only">
          Resources carried by
          {{
            shipSymbol
          }}
        </caption>

        <thead class="border-b text-muted-foreground">
          <tr>
            <th scope="col" class="px-3 py-3 font-medium">Resource</th>
            <th scope="col" class="px-3 py-3 text-right font-medium">Units</th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <tr v-for="item in cargo.inventory" :key="item.symbol">
            <th scope="row" class="px-3 py-4 font-normal">
              <p class="font-semibold">{{ item.name }}</p>
              <p class="mt-1 text-xs text-muted-foreground">{{ item.symbol }}</p>

              <p class="mt-2 max-w-xl text-sm text-muted-foreground">
                {{ item.description }}
              </p>
            </th>

            <td class="px-3 py-4 text-right align-top font-medium tabular-nums">
              {{ formatNumber(item.units) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="mt-5 rounded-lg bg-muted p-4">
      <p class="font-medium">
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
