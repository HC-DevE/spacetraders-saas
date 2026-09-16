export const routeNames = {
  login: 'login',

  agentOverview: 'agent-overview',

  fleet: 'fleet',
  shipDetail: 'ship-detail',

  systems: 'systems',
  systemDetail: 'system-detail',
  waypointDetail: 'waypoint-detail',

  market: 'market',

  notFound: 'not-found',
  designSystem: 'design-system',
} as const

export type AppRouteName = (typeof routeNames)[keyof typeof routeNames]
