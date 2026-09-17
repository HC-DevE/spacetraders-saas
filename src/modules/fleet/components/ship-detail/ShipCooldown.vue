<script setup lang="ts">
import { formatDate } from '@/shared/utils/formatters'

import type { Ship } from '../../schemas/ship.schema'
import { formatDuration } from '../../utils/ship-formatters'

defineProps<{
  cooldown: Ship['cooldown']
}>()
</script>

<template>
  <section class="flex min-w-0 flex-col border border-border bg-card text-card-foreground">
    <header class="border-b border-border px-5 py-4">
      <h2 class="text-base font-semibold">Cooldown</h2>

      <p class="mt-1 text-sm text-muted-foreground">Remaining operational delay.</p>
    </header>

    <div class="flex flex-1 flex-col p-5">
      <div>
        <p
          class="font-mono text-xl font-medium"
          :class="cooldown.remainingSeconds > 0 ? 'text-signal' : 'text-foreground'"
        >
          {{
            cooldown.remainingSeconds > 0
              ? formatDuration(cooldown.remainingSeconds)
              : 'No cooldown reported'
          }}
        </p>

        <p class="mt-1 text-xs text-muted-foreground">Remaining duration at the last update.</p>
      </div>

      <dl class="mt-5 grid gap-px border border-border bg-border">
        <div class="grid grid-cols-2 gap-4 bg-card px-4 py-3">
          <dt class="text-xs text-muted-foreground">Total duration</dt>

          <dd class="text-right font-mono text-sm tabular-nums">
            {{ formatDuration(cooldown.totalSeconds) }}
          </dd>
        </div>

        <div v-if="cooldown.expiration" class="grid grid-cols-2 gap-4 bg-card px-4 py-3">
          <dt class="text-xs text-muted-foreground">Reported expiration</dt>

          <dd class="text-right">
            <time :datetime="cooldown.expiration" class="font-mono text-xs">
              {{ formatDate(cooldown.expiration) }}
            </time>
          </dd>
        </div>
      </dl>

      <p class="mt-auto pt-5 text-xs text-muted-foreground">
        Refresh the ship to check its latest status.
      </p>
    </div>
  </section>
</template>
