<script setup lang="ts">
import type { Market } from '../schemas/market.schema'

defineProps<{
  market: Market
}>()
</script>

<template>
  <section aria-labelledby="market-resources-title" class="space-y-5">
    <div>
      <h2 id="market-resources-title" class="text-xl font-semibold tracking-tight">
        Market resources
      </h2>

      <p class="mt-1 text-sm text-muted-foreground">
        Goods exported, imported and exchanged at this marketplace.
      </p>
    </div>

    <div class="grid gap-5 lg:grid-cols-3">
      <section class="rounded-xl border bg-card p-5 shadow-sm">
        <h3 class="font-semibold">Exports</h3>

        <p class="mt-1 text-sm text-muted-foreground">
          Goods produced and exported from this market.
        </p>

        <div v-if="market.exports.length" class="mt-4 space-y-3">
          <article
            v-for="good in market.exports"
            :key="good.symbol"
            class="rounded-lg bg-muted p-4"
          >
            <h4 class="font-medium">
              {{ good.name }}
            </h4>

            <p class="mt-1 text-xs text-muted-foreground">
              {{ good.symbol }}
            </p>

            <p class="mt-2 text-sm leading-6 text-muted-foreground">
              {{ good.description }}
            </p>
          </article>
        </div>

        <p v-else class="mt-4 text-sm text-muted-foreground">No exports reported.</p>
      </section>

      <section class="rounded-xl border bg-card p-5 shadow-sm">
        <h3 class="font-semibold">Imports</h3>

        <p class="mt-1 text-sm text-muted-foreground">Goods currently sought by this market.</p>

        <div v-if="market.imports.length" class="mt-4 space-y-3">
          <article
            v-for="good in market.imports"
            :key="good.symbol"
            class="rounded-lg bg-muted p-4"
          >
            <h4 class="font-medium">
              {{ good.name }}
            </h4>

            <p class="mt-1 text-xs text-muted-foreground">
              {{ good.symbol }}
            </p>

            <p class="mt-2 text-sm leading-6 text-muted-foreground">
              {{ good.description }}
            </p>
          </article>
        </div>

        <p v-else class="mt-4 text-sm text-muted-foreground">No imports reported.</p>
      </section>

      <section class="rounded-xl border bg-card p-5 shadow-sm">
        <h3 class="font-semibold">Exchange</h3>

        <p class="mt-1 text-sm text-muted-foreground">Goods bought and sold between agents here.</p>

        <div v-if="market.exchange.length" class="mt-4 space-y-3">
          <article
            v-for="good in market.exchange"
            :key="good.symbol"
            class="rounded-lg bg-muted p-4"
          >
            <h4 class="font-medium">
              {{ good.name }}
            </h4>

            <p class="mt-1 text-xs text-muted-foreground">
              {{ good.symbol }}
            </p>

            <p class="mt-2 text-sm leading-6 text-muted-foreground">
              {{ good.description }}
            </p>
          </article>
        </div>

        <p v-else class="mt-4 text-sm text-muted-foreground">No exchange goods reported.</p>
      </section>
    </div>
  </section>
</template>
