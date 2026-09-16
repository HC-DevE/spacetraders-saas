<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/modules/auth/auth.store'
import AppButton from '@/shared/components/AppButton.vue'
import { useAuth } from '@/modules/auth/composables/use-auth'
import { routeNames } from '@/app/router/route-names'

const auth = useAuthStore()
const { logout } = useAuth()
const route = useRoute()
const router = useRouter()

const isFleetSection = computed(
  () => route.name === routeNames.fleet || route.name === routeNames.shipDetail,
)
const isSystemsSection = computed(() => route.path.startsWith('/systems')) //TODO

watch(
  () => auth.hasToken,
  (hasToken) => {
    if (!hasToken) {
      void router.replace({ name: routeNames.login })
    }
  },
)
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
    >
      Skip to content
    </a>

    <header class="border-b bg-card">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <RouterLink
          :to="{ name: routeNames.agentOverview }"
          class="flex items-center gap-3 rounded-sm font-semibold"
        >
          <!-- <span
            aria-hidden="true"
            class="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          >
            S
          </span> -->
          Space Control
        </RouterLink>

        <AppButton variant="outline" data-testid="logout" @click="logout()"> Sign out </AppButton>
      </div>

      <nav aria-label="Main navigation" class="mx-auto flex max-w-6xl gap-2 px-4 pb-3 sm:px-6">
        <RouterLink
          :to="{ name: routeNames.agentOverview }"
          class="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          exact-active-class="bg-secondary text-secondary-foreground"
        >
          Overview
        </RouterLink>

        <RouterLink
          :to="{ name: routeNames.fleet }"
          class="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          :class="{ 'bg-secondary text-secondary-foreground': isFleetSection }"
          :aria-current="
            isFleetSection ? (route.name === routeNames.fleet ? 'page' : 'location') : undefined
          "
        >
          Fleet
        </RouterLink>

        <RouterLink
          :to="{ name: routeNames.systems }"
          class="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
          :class="{
            'bg-secondary text-secondary-foreground': isSystemsSection,
          }"
          :aria-current="
            isSystemsSection ? (route.name === 'systems' ? 'page' : 'location') : undefined
          "
        >
          Systems
        </RouterLink>
      </nav>
    </header>

    <main id="main-content" tabindex="-1" class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <RouterView v-if="auth.hasToken" />
    </main>
  </div>
</template>
