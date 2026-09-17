import { routeNames } from '@/app/router/route-names'

export const navigationSections = {
  overview: 'overview',
  fleet: 'fleet',
  systems: 'systems',
} as const

export type NavigationSection = (typeof navigationSections)[keyof typeof navigationSections]

export const mainNavigation = [
  {
    label: 'Overview',
    section: navigationSections.overview,
    routeName: routeNames.agentOverview,
  },
  {
    label: 'Fleet',
    section: navigationSections.fleet,
    routeName: routeNames.fleet,
  },
  {
    label: 'Systems',
    section: navigationSections.systems,
    routeName: routeNames.systems,
  },
] as const
