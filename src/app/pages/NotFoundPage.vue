<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="grid min-h-screen place-items-center px-6">
    <div class="max-w-md space-y-4 text-center">
      <p class="font-semibold text-primary">404</p>

      <h1 class="text-3xl font-bold tracking-tight">Page not found</h1>

      <p class="text-muted-foreground">This address does not correspond to an available page.</p>

      <RouterLink
        to="/"
        class="inline-block rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
      >
        Return to the application
      </RouterLink>
    </div>
  </main>
</template>
