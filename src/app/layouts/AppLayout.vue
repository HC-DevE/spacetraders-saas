<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'

import AppHeader from '@/app/components/AppHeader.vue'
import AppNavigation from '@/app/components/AppNavigation.vue'
import { routeNames } from '@/app/router/route-names'
import { useAuthStore } from '@/modules/auth/auth.store'
import { useAuth } from '@/modules/auth/composables/use-auth'

const auth = useAuthStore()
const { logout } = useAuth()
const router = useRouter()

watch(
  () => auth.hasToken,
  (hasToken) => {
    if (!hasToken) {
      void router.replace({
        name: routeNames.login,
      })
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

    <AppHeader :agent-symbol="auth.agentSymbol ?? undefined" @sign-out="logout" />

    <AppNavigation />

    <main id="main-content" tabindex="-1" class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <RouterView v-if="auth.hasToken" />
    </main>
  </div>
</template>
