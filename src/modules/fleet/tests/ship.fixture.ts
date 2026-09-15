import type { Ship } from '../schemas/ship.schema'

export function createShip(symbol = 'TEST-1', variant: 'frigate' | 'probe' = 'frigate'): Ship {
  const isProbe = variant === 'probe'
  const timestamp = '2026-09-14T09:26:06.000Z'

  const waypoint: Ship['nav']['route']['origin'] = {
    symbol: isProbe ? 'X1-MQ65-H51' : 'X1-MQ65-A1',
    type: isProbe ? 'MOON' : 'PLANET',
    systemSymbol: 'X1-MQ65',
    x: isProbe ? -31 : -21,
    y: isProbe ? -31 : 12,
  }

  return {
    symbol,

    registration: {
      name: symbol,
      factionSymbol: 'COBALT',
      role: isProbe ? 'SATELLITE' : 'COMMAND',
    },

    nav: {
      systemSymbol: waypoint.systemSymbol,
      waypointSymbol: waypoint.symbol,
      status: 'DOCKED',
      flightMode: 'CRUISE',

      route: {
        origin: { ...waypoint },
        destination: { ...waypoint },
        departureTime: timestamp,
        arrival: timestamp,
      },
    },

    crew: {
      current: isProbe ? 0 : 57,
      required: isProbe ? 0 : 57,
      capacity: isProbe ? 0 : 80,
      rotation: 'STRICT',
      morale: 100,
      wages: 0,
    },

    frame: {
      symbol: isProbe ? 'FRAME_PROBE' : 'FRAME_FRIGATE',
      name: isProbe ? 'Probe' : 'Frigate',
      description: isProbe
        ? 'An unmanned spacecraft used for exploration.'
        : 'A multi-purpose spacecraft used for transport and support.',
      condition: 1,
      integrity: 1,
      quality: isProbe ? 1 : 4,
      moduleSlots: isProbe ? 0 : 8,
      mountingPoints: isProbe ? 0 : 5,
      fuelCapacity: isProbe ? 0 : 400,
      requirements: {
        power: isProbe ? 1 : 8,
        crew: isProbe ? 0 : 25,
      },
    },

    reactor: {
      symbol: isProbe ? 'REACTOR_SOLAR_I' : 'REACTOR_FISSION_I',
      name: isProbe ? 'Solar Reactor I' : 'Fission Reactor I',
      description: isProbe ? 'A solar power reactor.' : 'A fission power reactor.',
      condition: 1,
      integrity: 1,
      quality: isProbe ? 1 : 5,
      powerOutput: isProbe ? 3 : 31,
      requirements: {
        crew: isProbe ? 0 : 8,
      },
    },

    engine: {
      symbol: isProbe ? 'ENGINE_IMPULSE_DRIVE_I' : 'ENGINE_ION_DRIVE_II',
      name: isProbe ? 'Impulse Drive I' : 'Ion Drive II',
      description: isProbe ? 'A low-energy propulsion system.' : 'An ion propulsion system.',
      condition: 1,
      integrity: 1,
      quality: isProbe ? 1 : 4,
      speed: isProbe ? 9 : 36,
      requirements: {
        power: isProbe ? 1 : 6,
        crew: isProbe ? 0 : 8,
      },
    },

    modules: [],
    mounts: [],

    cargo: {
      units: 0,
      capacity: isProbe ? 0 : 40,
      inventory: [],
    },

    fuel: {
      current: isProbe ? 0 : 400,
      capacity: isProbe ? 0 : 400,
      consumed: {
        amount: 0,
        timestamp,
      },
    },

    cooldown: {
      shipSymbol: symbol,
      totalSeconds: 0,
      remainingSeconds: 0,
    },
  }
}
