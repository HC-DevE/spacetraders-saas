import { describe, expect, it } from 'vitest'

import { createWaypoint } from './waypoint.fixture'
import { getMarketplaceStatus, hasWaypointTrait } from '../utils/waypoint-status'

describe('waypoint status', () => {
  it('detects known waypoint traits', () => {
    const waypoint = createWaypoint()

    expect(hasWaypointTrait(waypoint, 'MARKETPLACE')).toBe(true)
    expect(hasWaypointTrait(waypoint, 'UNCHARTED')).toBe(false)
  })

  it('reports marketplace availability from waypoint traits', () => {
    expect(getMarketplaceStatus(createWaypoint())).toBe('Available')
    expect(getMarketplaceStatus(createWaypoint('X1-TEST-A2', 'uncharted'))).toBe('Unknown')
  })

  it('reports an absent marketplace trait for a charted waypoint', () => {
    const waypoint = createWaypoint()
    waypoint.traits = waypoint.traits.filter((trait) => trait.symbol !== 'MARKETPLACE')

    expect(getMarketplaceStatus(waypoint)).toBe('No marketplace trait')
  })
})
