import { z } from 'zod'

import { shipSchema } from './ship.schema'

export const shipsPageSizes: readonly number[] = [1, 5, 10, 20]

const pageSchema = z.number().int().positive()
const limitSchema = z.number().int().min(1).max(20)

export const shipsParamsSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
})

const positiveIntegerQuerySchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(pageSchema)

export const shipsSearchSchema = z.object({
  page: positiveIntegerQuerySchema.catch(1),

  limit: positiveIntegerQuerySchema.refine((value) => shipsPageSizes.includes(value)).catch(10),
})

export const shipsResponseSchema = z.object({
  data: z.array(shipSchema),

  meta: z.object({
    page: pageSchema,
    limit: limitSchema,
    total: z.number().int().nonnegative(),
  }),
})

export type ShipsParams = z.infer<typeof shipsParamsSchema>
export type ShipsResponse = z.infer<typeof shipsResponseSchema>
