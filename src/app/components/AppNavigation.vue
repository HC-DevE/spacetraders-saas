<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

import { mainNavigation, type NavigationSection } from '@/app/navigation/main-navigation'

const route = useRoute()

function isActiveSection(section: NavigationSection): boolean {
  return route.meta.navigationSection === section
}

function getAriaCurrent(item: (typeof mainNavigation)[number]): 'page' | 'location' | undefined {
  if (!isActiveSection(item.section)) {
    return undefined
  }

  return route.name === item.routeName ? 'page' : 'location'
}
</script>

<template>
  <nav aria-label="Main navigation" class="mx-auto flex max-w-6xl gap-2 px-4 pb-3 sm:px-6">
    <RouterLink
      v-for="item in mainNavigation"
      :key="item.section"
      :to="{ name: item.routeName }"
      :aria-current="getAriaCurrent(item)"
      class="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
      :class="{
        'bg-secondary text-secondary-foreground': isActiveSection(item.section),
      }"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>
