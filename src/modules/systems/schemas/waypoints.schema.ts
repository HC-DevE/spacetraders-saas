import { z } from 'zod'

import { waypointSchema, waypointTraitSymbolSchema } from './waypoint.schema'

export const waypointsPageSizes: readonly number[] = [10, 20]

const pageSchema = z.number().int().positive()
const limitSchema = z.number().int().min(1).max(20)

export const waypointsParamsSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  traits: z.array(waypointTraitSymbolSchema).min(1).optional(),
})

const positiveIntegerQuerySchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(pageSchema)

const marketplaceQuerySchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .catch(false)

export const waypointsSearchSchema = z.object({
  page: positiveIntegerQuerySchema.catch(1),

  limit: positiveIntegerQuerySchema.refine((value) => waypointsPageSizes.includes(value)).catch(10),

  marketplace: marketplaceQuerySchema,
})

export const waypointsResponseSchema = z.object({
  data: z.array(waypointSchema),

  meta: z.object({
    page: pageSchema,
    limit: limitSchema,
    total: z.number().int().nonnegative(),
  }),
})

export type WaypointsParams = z.infer<typeof waypointsParamsSchema>
export type WaypointsResponse = z.infer<typeof waypointsResponseSchema>
