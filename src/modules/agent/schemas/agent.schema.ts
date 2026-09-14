import { z } from 'zod'

export const agentSchema = z.object({
  symbol: z.string().min(1),
  headquarters: z.string().min(1),
  credits: z.number().finite(),
  startingFaction: z.string().min(1),
  shipCount: z.number().int().nonnegative(),
})

export const agentResponseSchema = z.object({
  data: agentSchema,
})

export type Agent = z.infer<typeof agentSchema>
