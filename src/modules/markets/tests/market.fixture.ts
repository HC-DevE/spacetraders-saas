import type { Market } from '../schemas/market.schema'

export function createMarket(symbol = 'X1-TEST-A1', variant: 'full' | 'partial' = 'full'): Market {
  const market: Market = {
    symbol,

    exports: [
      {
        symbol: 'IRON',
        name: 'Iron',
        description: 'A common metal used in manufacturing.',
      },
    ],

    imports: [
      {
        symbol: 'FUEL',
        name: 'Fuel',
        description: 'Fuel used to power ships.',
      },
    ],

    exchange: [
      {
        symbol: 'FOOD',
        name: 'Food',
        description: 'Food supplies traded between agents.',
      },
    ],
  }

  if (variant === 'partial') {
    return market
  }

  return {
    ...market,

    tradeGoods: [
      {
        symbol: 'IRON',
        type: 'EXPORT',
        tradeVolume: 120,
        supply: 'HIGH',
        activity: 'STRONG',
        purchasePrice: 42,
        sellPrice: 36,
      },
      {
        symbol: 'FUEL',
        type: 'IMPORT',
        tradeVolume: 80,
        supply: 'LIMITED',
        activity: 'GROWING',
        purchasePrice: 120,
        sellPrice: 105,
      },
      {
        symbol: 'FOOD',
        type: 'EXCHANGE',
        tradeVolume: 50,
        supply: 'MODERATE',
        purchasePrice: 65,
        sellPrice: 58,
      },
    ],

    transactions: [
      {
        waypointSymbol: symbol,
        shipSymbol: 'TEST-SHIP-1',
        tradeSymbol: 'IRON',
        type: 'SELL',
        units: 10,
        pricePerUnit: 36,
        totalPrice: 360,
        timestamp: '2026-01-01T12:00:00.000Z',
      },
    ],
  }
}
