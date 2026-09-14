import { createRouter, createWebHistory, type RouterHistory, type RouteRecordRaw } from 'vue-router'

import type { AuthStore } from '@/modules/auth/auth.store'

export function createAppRouter(
  auth: AuthStore,
  history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
) {
  const routes: RouteRecordRaw[] = [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/pages/LoginPage.vue'),
    },
    {
      path: '/',
      component: () => import('@/app/layouts/AppLayout.vue'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          name: 'agent-overview',
          component: () => import('@/modules/agent/pages/AgentOverviewPage.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/app/pages/NotFoundPage.vue'),
    },
  ]

  if (import.meta.env.DEV) {
    routes.push({
      path: '/design-system',
      name: 'design-system',
      component: () => import('@/app/pages/DesignSystemPage.vue'),
    })
  }

  const router = createRouter({
    history,
    routes,
  })

  router.beforeEach((to) => {
    if (to.meta.requiresAuth && !auth.hasToken) {
      return {
        name: 'login',
        replace: true,
      }
    }

    if (to.name === 'login' && auth.hasToken) {
      return {
        name: 'agent-overview',
        replace: true,
      }
    }
  })

  return router
}
