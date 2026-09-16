import type { WaypointsParams } from '../schemas/waypoints.schema'

export const waypointKeys = {
  list: (systemSymbol: string, params: WaypointsParams) =>
    ['waypoints', 'list', systemSymbol, params] as const,

  detail: (systemSymbol: string, waypointSymbol: string) =>
    ['waypoints', 'detail', systemSymbol, waypointSymbol] as const,
}
