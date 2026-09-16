import { ApiError } from '@/shared/api/api-error'
import { apiEndpoints } from '@/shared/api/endpoints'
import { getJson } from '@/shared/api/http'

import { agentResponseSchema, type Agent } from '../schemas/agent.schema'

export async function getAgent(token: string, signal?: AbortSignal): Promise<Agent> {
  const response = await getJson(apiEndpoints.agent.current, token, signal)

  const result = agentResponseSchema.safeParse(response)

  if (!result.success) {
    throw new ApiError(
      'invalid-response',
      'The agent information received is incomplete or invalid. Please try again.',
    )
  }

  return result.data.data
}
