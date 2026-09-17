<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import AppButton from '@/shared/components/AppButton.vue'

defineProps<{
  agentSymbol?: string
}>()

const emit = defineEmits<{
  signOut: []
}>()
</script>

<template>
  <header class="border-b bg-card">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <RouterLink :to="{ name: routeNames.agentOverview }" class="min-w-0 rounded-sm font-semibold">
        Space Control
      </RouterLink>

      <div class="flex min-w-0 items-center gap-3">
        <div v-if="agentSymbol" class="min-w-0 text-right">
          <p class="text-xs text-muted-foreground">Agent</p>

          <p class="max-w-40 truncate text-sm font-medium" :title="agentSymbol">
            {{ agentSymbol }}
          </p>
        </div>

        <AppButton
          variant="destructive"
          class="shrink-0"
          data-testid="logout"
          @click="emit('signOut')"
        >
          Sign out
        </AppButton>
      </div>
    </div>
  </header>
</template>
