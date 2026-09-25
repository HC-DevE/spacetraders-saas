<script setup lang="ts">
import type { Market } from '../schemas/market.schema'

defineProps<{
  market: Market
}>()
</script>

<template>
  <section aria-labelledby="market-resources-title">
    <div>
      <h2 id="market-resources-title" class="text-base font-semibold">Market resources</h2>

      <p class="mt-1 text-sm text-muted-foreground">
        Goods exported, imported and exchanged at this marketplace.
      </p>
    </div>

    <div class="mt-4 grid gap-5 lg:grid-cols-3">
      <section aria-labelledby="market-exports-title">
        <header class="bg-foreground px-5 py-4 text-background">
          <div class="flex items-center justify-between gap-4">
            <h3 id="market-exports-title" class="text-sm font-semibold uppercase tracking-[0.14em]">
              Exports
            </h3>

            <span
              class="border border-background/30 bg-background/10 px-2 py-1 font-mono text-xs tabular-nums"
              :aria-label="`${market.exports.length} exports`"
            >
              {{ market.exports.length }}
            </span>
          </div>

          <p class="mt-2 text-xs leading-5 text-background/70">
            Goods produced and exported from this market.
          </p>
        </header>

        <div class="border border-t-0 border-border bg-card">
          <ul v-if="market.exports.length" class="divide-y divide-border">
            <li v-for="good in market.exports" :key="good.symbol" class="px-5 py-4">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h4 class="text-sm font-medium text-foreground">
                  {{ good.name }}
                </h4>

                <span class="font-mono text-[11px] text-muted-foreground">
                  {{ good.symbol }}
                </span>
              </div>

              <p class="mt-2 text-sm leading-6 text-muted-foreground">
                {{ good.description }}
              </p>
            </li>
          </ul>

          <p v-else class="px-5 py-4 text-sm text-muted-foreground">No exports reported.</p>
        </div>
      </section>

      <section aria-labelledby="market-imports-title">
        <header class="bg-foreground px-5 py-4 text-background">
          <div class="flex items-center justify-between gap-4">
            <h3 id="market-imports-title" class="text-sm font-semibold uppercase tracking-[0.14em]">
              Imports
            </h3>

            <span
              class="border border-background/30 bg-background/10 px-2 py-1 font-mono text-xs tabular-nums"
              :aria-label="`${market.imports.length} imports`"
            >
              {{ market.imports.length }}
            </span>
          </div>

          <p class="mt-2 text-xs leading-5 text-background/70">
            Goods currently sought by this market.
          </p>
        </header>

        <div class="border border-t-0 border-border bg-card">
          <ul v-if="market.imports.length" class="divide-y divide-border">
            <li v-for="good in market.imports" :key="good.symbol" class="px-5 py-4">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h4 class="text-sm font-medium text-foreground">
                  {{ good.name }}
                </h4>

                <span class="font-mono text-[11px] text-muted-foreground">
                  {{ good.symbol }}
                </span>
              </div>

              <p class="mt-2 text-sm leading-6 text-muted-foreground">
                {{ good.description }}
              </p>
            </li>
          </ul>

          <p v-else class="px-5 py-4 text-sm text-muted-foreground">No imports reported.</p>
        </div>
      </section>

      <section aria-labelledby="market-exchange-title">
        <header class="bg-foreground px-5 py-4 text-background">
          <div class="flex items-center justify-between gap-4">
            <h3
              id="market-exchange-title"
              class="text-sm font-semibold uppercase tracking-[0.14em]"
            >
              Exchange
            </h3>

            <span
              class="border border-background/30 bg-background/10 px-2 py-1 font-mono text-xs tabular-nums"
              :aria-label="`${market.exchange.length} exchange goods`"
            >
              {{ market.exchange.length }}
            </span>
          </div>

          <p class="mt-2 text-xs leading-5 text-background/70">
            Goods bought and sold between agents here.
          </p>
        </header>

        <div class="border border-t-0 border-border bg-card">
          <ul v-if="market.exchange.length" class="divide-y divide-border">
            <li v-for="good in market.exchange" :key="good.symbol" class="px-5 py-4">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h4 class="text-sm font-medium text-foreground">
                  {{ good.name }}
                </h4>

                <span class="font-mono text-[11px] text-muted-foreground">
                  {{ good.symbol }}
                </span>
              </div>

              <p class="mt-2 text-sm leading-6 text-muted-foreground">
                {{ good.description }}
              </p>
            </li>
          </ul>

          <p v-else class="px-5 py-4 text-sm text-muted-foreground">No exchange goods reported.</p>
        </div>
      </section>
    </div>
  </section>
</template>
