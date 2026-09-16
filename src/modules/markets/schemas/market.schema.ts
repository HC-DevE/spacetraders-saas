import { z } from 'zod'
import { tradeSymbolSchema } from '@/shared/schemas/trade-symbol.schema'

// Valeurs communes

const nonNegativeIntegerSchema = z.number().int().nonnegative()
const dateTimeSchema = z.iso.datetime({ offset: true })
const waypointSymbolSchema = z.string().min(1)

// Énumérations

const marketTradeGoodTypeSchema = z.enum(['EXPORT', 'IMPORT', 'EXCHANGE'])

const supplyLevelSchema = z.enum(['SCARCE', 'LIMITED', 'MODERATE', 'HIGH', 'ABUNDANT'])

const activityLevelSchema = z.enum(['WEAK', 'GROWING', 'STRONG', 'RESTRICTED'])

const marketTransactionTypeSchema = z.enum(['PURCHASE', 'SELL'])

// Ressources disponibles sur le marché

const tradeGoodSchema = z.object({
  symbol: tradeSymbolSchema,
  name: z.string(),
  description: z.string(),
})

// Données commerciales détaillées

const marketTradeGoodSchema = z.object({
  symbol: tradeSymbolSchema,
  type: marketTradeGoodTypeSchema,
  tradeVolume: z.number().int().min(1),
  supply: supplyLevelSchema,
  activity: activityLevelSchema.optional(),
  purchasePrice: nonNegativeIntegerSchema,
  sellPrice: nonNegativeIntegerSchema,
})

// Transactions récentes

const marketTransactionSchema = z.object({
  waypointSymbol: waypointSymbolSchema,
  shipSymbol: z.string(),
  tradeSymbol: z.string(),
  type: marketTransactionTypeSchema,
  units: nonNegativeIntegerSchema,
  pricePerUnit: nonNegativeIntegerSchema,
  totalPrice: nonNegativeIntegerSchema,
  timestamp: dateTimeSchema,
})

// Marché

export const marketSchema = z.object({
  symbol: z.string(),
  exports: z.array(tradeGoodSchema),
  imports: z.array(tradeGoodSchema),
  exchange: z.array(tradeGoodSchema),

  transactions: z.array(marketTransactionSchema).optional(),

  tradeGoods: z.array(marketTradeGoodSchema).optional(),
})

// Réponse de GET /systems/{systemSymbol}/waypoints/{waypointSymbol}/market

export const marketResponseSchema = z.object({
  data: marketSchema,
})

export type Market = z.infer<typeof marketSchema>
