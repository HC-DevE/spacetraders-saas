<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import { ApiError } from '@/shared/api/api-error'
import AppButton from '@/shared/components/AppButton.vue'
import FeedbackState from '@/shared/components/feedback/FeedbackState.vue'

import MarketGoodsTable from '../components/MarketGoodsTable.vue'
import MarketResources from '../components/MarketResources.vue'
import MarketTransactionsTable from '../components/MarketTransactionsTable.vue'
import { useMarketQuery } from '../composables/use-market-query'
import { routeNames } from '@/app/router/route-names.ts'

const route = useRoute()

const systemSymbol = computed(() =>
  typeof route.params.systemSymbol === 'string' ? route.params.systemSymbol : '',
)

const waypointSymbol = computed(() =>
  typeof route.params.waypointSymbol === 'string' ? route.params.waypointSymbol : '',
)

const {
  data: market,
  error,
  isPending,
  isFetching,
  isPaused,
  refetch,
} = useMarketQuery(systemSymbol, waypointSymbol)

const isNotFound = computed(() => error.value instanceof ApiError && error.value.status === 404)
</script>

<template>
  <section class="min-w-0 space-y-8 wrap-anywhere">
    <RouterLink
      :to="{
        name: routeNames.waypointDetail,
        params: {
          systemSymbol,
          waypointSymbol,
        },
      }"
      aria-label="Back to waypoint"
      class="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      <span aria-hidden="true"> ← </span>

      Back to waypoint
    </RouterLink>

    <FeedbackState
      v-if="!systemSymbol || !waypointSymbol"
      kind="error"
      title="Invalid market address"
      description="Return to the waypoint and open its marketplace again."
    />

    <FeedbackState
      v-else-if="isPending"
      kind="loading"
      :title="isPaused ? 'Waiting for connection' : 'Loading market'"
      :description="
        isPaused
          ? 'The request will resume when your connection is available.'
          : 'Retrieving marketplace information.'
      "
    />

    <template v-else-if="market">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="text-sm font-medium text-muted-foreground">Marketplace</p>

          <h1 class="mt-1 text-2xl font-semibold tracking-tight">
            {{ market.symbol }}
          </h1>

          <p class="mt-1 text-sm text-muted-foreground">
            <RouterLink
              :to="{ name: routeNames.systemDetail, params: { systemSymbol } }"
              :aria-label="`Open system ${systemSymbol}`"
              class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ systemSymbol }}
            </RouterLink>
          </p>
        </div>

        <AppButton
          variant="outline"
          aria-label="Refresh market"
          :loading="isFetching"
          :disabled="isPaused"
          loading-label="Refreshing…"
          @click="refetch()"
        >
          Refresh market
        </AppButton>
      </header>

      <div
        v-if="error"
        role="alert"
        class="rounded-xl border border-warning/30 bg-warning-subtle p-4 text-warning"
      >
        <p class="font-semibold">Could not refresh market</p>

        <p class="mt-1 text-sm">
          {{ error.message }}
        </p>

        <p class="mt-2 text-sm">
          The last successfully loaded market information is still displayed.
        </p>
      </div>

      <p v-if="isPaused" role="status" class="text-sm text-muted-foreground">
        Market refresh is waiting for a connection.
      </p>

      <p v-else-if="isFetching" role="status" class="text-sm text-muted-foreground">
        Updating market information…
      </p>

      <MarketResources :market="market" />

      <section aria-labelledby="market-prices-title" class="space-y-4">
        <div>
          <h2 id="market-prices-title" class="text-xl font-semibold tracking-tight">
            Trade prices
          </h2>

          <p class="mt-1 text-sm text-muted-foreground">
            Current prices, volume and supply when detailed market data is available.
          </p>
        </div>

        <MarketGoodsTable v-if="market.tradeGoods?.length" :goods="market.tradeGoods" />

        <FeedbackState
          v-else-if="market.tradeGoods"
          kind="empty"
          title="No priced goods reported"
          description="Detailed market data is available, but no trade goods were returned."
        />

        <div v-else class="rounded-xl border bg-muted/40 p-5">
          <p class="font-semibold">Detailed prices unavailable</p>

          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            SpaceTraders only exposes trade prices when one of your ships is present at this
            marketplace.
          </p>
        </div>
      </section>

      <section aria-labelledby="market-transactions-title" class="space-y-4">
        <div>
          <h2 id="market-transactions-title" class="text-xl font-semibold tracking-tight">
            Recent transactions
          </h2>

          <p class="mt-1 text-sm text-muted-foreground">
            Recent purchases and sales when transaction data is available.
          </p>
        </div>

        <MarketTransactionsTable
          v-if="market.transactions?.length"
          :transactions="market.transactions"
        />

        <FeedbackState
          v-else-if="market.transactions"
          kind="empty"
          title="No recent transactions"
          description="Transaction data is available, but no recent transactions were returned."
        />

        <div v-else class="rounded-xl border bg-muted/40 p-5">
          <p class="font-semibold">Transaction history unavailable</p>

          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            Recent transactions become available when one of your ships is present at this
            marketplace.
          </p>
        </div>
      </section>
    </template>

    <FeedbackState
      v-else-if="error"
      kind="error"
      :title="isNotFound ? 'Market not found' : 'Unable to load market'"
      :description="
        isNotFound ? 'No accessible market could be found for this waypoint.' : error.message
      "
    >
      <AppButton
        v-if="!isNotFound"
        :loading="isFetching"
        :disabled="isPaused"
        loading-label="Retrying…"
        @click="refetch()"
      >
        Try again
      </AppButton>
    </FeedbackState>
  </section>
</template>
