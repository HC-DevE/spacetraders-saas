import type { Waypoint } from '../schemas/waypoint.schema'

export function createWaypoint(
  symbol = 'X1-TEST-A1',
  variant: 'marketplace' | 'uncharted' = 'marketplace',
): Waypoint {
  if (variant === 'uncharted') {
    return {
      symbol,
      systemSymbol: 'X1-TEST',
      type: 'ASTEROID',
      x: -18,
      y: 31,
      orbitals: [],
      traits: [
        {
          symbol: 'UNCHARTED',
          name: 'Uncharted',
          description: 'This waypoint has not been charted yet.',
        },
      ],
      isUnderConstruction: false,
    }
  }

  return {
    symbol,
    systemSymbol: 'X1-TEST',
    type: 'PLANET',
    x: 12,
    y: -7,

    orbitals: [
      {
        symbol: `${symbol}-MOON`,
      },
    ],

    faction: {
      symbol: 'COSMIC',
    },

    traits: [
      {
        symbol: 'MARKETPLACE',
        name: 'Marketplace',
        description: 'A marketplace where goods can be traded.',
      },
      {
        symbol: 'TRADING_HUB',
        name: 'Trading Hub',
        description: 'A major hub for commercial activity.',
      },
    ],

    modifiers: [],

    chart: {
      waypointSymbol: symbol,
      submittedBy: 'TEST',
      submittedOn: '2026-01-01T12:00:00.000Z',
    },

    isUnderConstruction: false,
  }
}
