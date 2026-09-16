import type { System } from '../schemas/system.schema'

export function createSystem(symbol = 'X1-TEST', variant: 'star' | 'nebula' = 'star'): System {
  const isNebula = variant === 'nebula'

  if (isNebula) {
    return {
      symbol,
      sectorSymbol: 'X1',
      type: 'NEBULA',
      x: 84,
      y: -61,
      waypoints: [
        {
          symbol: `${symbol}-A1`,
          type: 'JUMP_GATE',
          x: 4,
          y: -7,
          orbitals: [],
        },
      ],
      factions: [],
    }
  }

  const planetSymbol = `${symbol}-A1`
  const moonSymbol = `${symbol}-A2`

  return {
    symbol,
    sectorSymbol: 'X1',
    constellation: 'Test Constellation',
    name: 'Test System',
    type: 'RED_STAR',
    x: -21,
    y: 37,

    waypoints: [
      {
        symbol: planetSymbol,
        type: 'PLANET',
        x: 10,
        y: -5,
        orbitals: [
          {
            symbol: moonSymbol,
          },
        ],
      },
      {
        symbol: moonSymbol,
        type: 'MOON',
        x: 13,
        y: -8,
        orbitals: [],
        orbits: planetSymbol,
      },
    ],

    factions: [
      {
        symbol: 'COSMIC',
      },
    ],
  }
}
