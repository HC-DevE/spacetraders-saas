<script setup lang="ts">
import { RouterLink } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import AppButton from '@/shared/components/AppButton.vue'

const logoUrl = `${import.meta.env.BASE_URL}favicon.jpg`

defineProps<{
  agentSymbol?: string
}>()

const emit = defineEmits<{
  signOut: []
}>()
</script>

<template>
  <header class="border-b border-border bg-background">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <RouterLink
        :to="{ name: routeNames.agentOverview }"
        class="flex min-w-0 items-center gap-2.5 rounded-sm text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <img :src="logoUrl" alt="" class="size-8 rounded-md object-cover" aria-hidden="true" />
        <span class="truncate"> Space Control </span>
        <!-- <span class="font-semibold tracking-tight"> Space Control </span> -->
      </RouterLink>

      <div class="flex min-w-0 items-center gap-3 sm:gap-4">
        <span
          v-if="agentSymbol"
          class="hidden max-w-48 truncate font-mono text-sm text-muted-foreground sm:block"
          :title="agentSymbol"
        >
          {{ agentSymbol }}
        </span>

        <AppButton
          variant="outline"
          class="h-8 shrink-0 px-3 text-xs sm:px-4"
          data-testid="logout"
          @click="emit('signOut')"
        >
          Sign out
        </AppButton>
      </div>
    </div>
  </header>
</template>
