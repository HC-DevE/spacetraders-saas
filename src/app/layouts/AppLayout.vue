<script setup lang="ts">
import { watch } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

import { useAuthStore } from '@/modules/auth/auth.store'
import { useAuth } from '@/modules/agent/composables/use-auth'
import AppButton from '@/shared/components/AppButton.vue'

const router = useRouter()
const auth = useAuthStore()
const { logout } = useAuth()

watch(
  () => auth.hasToken,
  async (hasToken) => {
    if (!hasToken) {
      await router.replace({ name: 'login' })
    }
  },
)
</script>

<template>
  <div class="min-h-screen">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:p-3"
    >
      Skip to content
    </a>

    <header class="border-b bg-card">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <RouterLink :to="{ name: 'agent-overview' }" class="flex items-center gap-3">
          <!-- <span
            aria-hidden="true"
            class="grid size-10 place-items-center rounded-xl bg-primary font-bold text-primary-foreground"
          >
            S
          </span> -->

          <span>
            <span class="block font-semibold tracking-tight"> SpaceTraders </span>
            <!-- <span class="block text-xs text-muted-foreground"> Operations console </span> -->
          </span>
        </RouterLink>

        <AppButton variant="outline" data-testid="logout" @click="logout"> Sign out </AppButton>
      </div>
    </header>

    <main id="main-content" tabindex="-1" class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <RouterView v-if="auth.hasToken" />
    </main>
  </div>
</template>
