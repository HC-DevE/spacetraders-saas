import 'vue-router'

import type { NavigationSection } from '@/app/navigation/main-navigation'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    navigationSection?: NavigationSection
  }
}
