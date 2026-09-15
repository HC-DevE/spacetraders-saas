<script setup lang="ts">
import type { Ship } from '../../schemas/ship.schema'
import { formatDate, formatDuration } from '../../utils/ship-formatters'

defineProps<{ cooldown: Ship['cooldown'] }>()
</script>

<template>
  <section
    class="flex min-w-0 flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
  >
    <h2 class="text-lg font-semibold">Cooldown</h2>

    <div class="mt-5">
      <p class="text-lg font-semibold">
        {{
          cooldown.remainingSeconds > 0
            ? formatDuration(cooldown.remainingSeconds)
            : 'No cooldown reported'
        }}
      </p>

      <p class="mt-1 text-sm text-muted-foreground">Remaining duration at the last update.</p>

      <dl class="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div class="min-w-0">
          <dt class="text-muted-foreground">Total duration</dt>
          <dd class="mt-1 font-medium">
            {{ formatDuration(cooldown.totalSeconds) }}
          </dd>
        </div>

        <div v-if="cooldown.expiration" class="min-w-0">
          <dt class="text-muted-foreground">Reported expiration</dt>
          <dd class="mt-1">
            <time :datetime="cooldown.expiration">
              {{ formatDate(cooldown.expiration) }}
            </time>
          </dd>
        </div>
      </dl>
    </div>

    <p class="mt-auto pt-5 text-xs text-muted-foreground">
      Refresh the ship to check its latest status.
    </p>
  </section>
</template>
