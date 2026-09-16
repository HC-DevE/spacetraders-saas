import type { Waypoint } from '../schemas/waypoint.schema'

type WaypointTraitSymbol = Waypoint['traits'][number]['symbol']

export function hasWaypointTrait(waypoint: Waypoint, symbol: WaypointTraitSymbol): boolean {
  return waypoint.traits.some((trait) => trait.symbol === symbol)
}

export function getMarketplaceStatus(waypoint: Waypoint): string {
  if (hasWaypointTrait(waypoint, 'MARKETPLACE')) {
    return 'Available'
  }

  if (hasWaypointTrait(waypoint, 'UNCHARTED')) {
    return 'Unknown'
  }

  return 'No marketplace trait'
}
