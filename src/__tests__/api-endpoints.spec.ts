import { describe, expect, it } from 'vitest'

import { apiEndpoints } from '@/shared/api/endpoints'

describe('API endpoints', () => {
  it('builds static resource endpoints', () => {
    expect(apiEndpoints.agent.current).toBe('/my/agent')

    expect(apiEndpoints.ships.list).toBe('/my/ships')

    expect(apiEndpoints.systems.list).toBe('/systems')
  })

  it('builds ship detail endpoints', () => {
    expect(apiEndpoints.ships.detail('TEST-SHIP-1')).toBe('/my/ships/TEST-SHIP-1')
  })

  it('builds system and waypoint endpoints', () => {
    expect(apiEndpoints.systems.detail('X1-TEST')).toBe('/systems/X1-TEST')

    expect(apiEndpoints.systems.waypoints.list('X1-TEST')).toBe('/systems/X1-TEST/waypoints')

    expect(apiEndpoints.systems.waypoints.detail('X1-TEST', 'X1-TEST-A1')).toBe(
      '/systems/X1-TEST/waypoints/X1-TEST-A1',
    )

    expect(apiEndpoints.systems.waypoints.market('X1-TEST', 'X1-TEST-A1')).toBe(
      '/systems/X1-TEST/waypoints/X1-TEST-A1/market',
    )
  })

  it('encodes dynamic path segments', () => {
    expect(apiEndpoints.ships.detail('SHIP/TEST')).toBe('/my/ships/SHIP%2FTEST')

    expect(apiEndpoints.systems.waypoints.detail('X1 TEST', 'X1 TEST/A1')).toBe(
      '/systems/X1%20TEST/waypoints/X1%20TEST%2FA1',
    )
  })
})
