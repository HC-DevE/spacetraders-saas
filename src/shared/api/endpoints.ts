function encodePathSegment(value: string): string {
  return encodeURIComponent(value)
}

export const apiEndpoints = {
  agent: {
    current: '/my/agent',
  },

  ships: {
    list: '/my/ships',

    detail: (shipSymbol: string): string => `/my/ships/${encodePathSegment(shipSymbol)}`,
  },

  systems: {
    list: '/systems',

    detail: (systemSymbol: string): string => `/systems/${encodePathSegment(systemSymbol)}`,

    waypoints: {
      list: (systemSymbol: string): string =>
        `/systems/${encodePathSegment(systemSymbol)}/waypoints`,

      detail: (systemSymbol: string, waypointSymbol: string): string =>
        `/systems/${encodePathSegment(systemSymbol)}/waypoints/${encodePathSegment(waypointSymbol)}`,

      market: (systemSymbol: string, waypointSymbol: string): string =>
        `/systems/${encodePathSegment(systemSymbol)}/waypoints/${encodePathSegment(waypointSymbol)}/market`,
    },
  },
} as const
