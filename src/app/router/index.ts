import { createRouter, createWebHistory, type RouterHistory, type RouteRecordRaw } from 'vue-router'

import type { AuthStore } from '@/modules/auth/auth.store'

import { routeNames } from './route-names'
import { navigationSections } from '@/app/navigation/main-navigation'

export function createAppRouter(
  auth: AuthStore,
  history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
) {
  const routes: RouteRecordRaw[] = [
    {
      path: '/login',
      name: routeNames.login,
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
          name: routeNames.agentOverview,
          component: () => import('@/modules/agent/pages/AgentOverviewPage.vue'),
          meta: {
            navigationSection: navigationSections.overview,
          },
        },

        {
          path: 'fleet',
          name: routeNames.fleet,
          component: () => import('@/modules/fleet/pages/FleetPage.vue'),
          meta: {
            navigationSection: navigationSections.fleet,
          },
        },
        {
          path: 'fleet/:symbol',
          name: routeNames.shipDetail,
          component: () => import('@/modules/fleet/pages/ShipDetailPage.vue'),
          meta: {
            navigationSection: navigationSections.fleet,
          },
        },

        {
          path: 'systems',
          name: routeNames.systems,
          component: () => import('@/modules/systems/pages/SystemsPage.vue'),
          meta: {
            navigationSection: navigationSections.systems,
          },
        },
        {
          path: 'systems/:systemSymbol',
          name: routeNames.systemDetail,
          component: () => import('@/modules/systems/pages/SystemDetailPage.vue'),
          meta: {
            navigationSection: navigationSections.systems,
          },
        },
        {
          path: 'systems/:systemSymbol/waypoints/:waypointSymbol',
          name: routeNames.waypointDetail,
          component: () => import('@/modules/systems/pages/WaypointDetailPage.vue'),
          meta: {
            navigationSection: navigationSections.systems,
          },
        },
        {
          path: 'systems/:systemSymbol/waypoints/:waypointSymbol/market',
          name: routeNames.market,
          component: () => import('@/modules/markets/pages/MarketPage.vue'),
          meta: {
            navigationSection: navigationSections.systems,
          },
        },
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      name: routeNames.notFound,
      component: () => import('@/app/pages/NotFoundPage.vue'),
    },
  ]

  if (import.meta.env.DEV) {
    routes.push({
      path: '/design-system',
      name: routeNames.designSystem,
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
        name: routeNames.login,
        replace: true,
      }
    }

    if (to.name === routeNames.login && auth.hasToken) {
      return {
        name: routeNames.agentOverview,
        replace: true,
      }
    }
  })

  return router
}
