import { z } from 'zod'

import { systemSchema } from './system.schema'

export const systemsPageSizes: readonly number[] = [10, 20]

const pageSchema = z.number().int().positive()
const limitSchema = z.number().int().min(1).max(20)

export const systemsParamsSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
})

const positiveIntegerQuerySchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(pageSchema)

export const systemsSearchSchema = z.object({
  page: positiveIntegerQuerySchema.catch(1),

  limit: positiveIntegerQuerySchema.refine((value) => systemsPageSizes.includes(value)).catch(10),
})

export const systemsResponseSchema = z.object({
  data: z.array(systemSchema),

  meta: z.object({
    page: pageSchema,
    limit: limitSchema,
    total: z.number().int().nonnegative(),
  }),
})

export type SystemsParams = z.infer<typeof systemsParamsSchema>
export type SystemsResponse = z.infer<typeof systemsResponseSchema>
