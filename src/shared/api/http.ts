import axios from 'axios'
import { z } from 'zod'

import { ApiError } from './api-error'

const http = axios.create({
  baseURL: 'https://api.spacetraders.io/v2',
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
  },
})

const errorResponseSchema = z.object({
  error: z.object({
    code: z.number().int(),
  }),
})

function normalizeError(error: unknown): ApiError {
  if (!axios.isAxiosError<unknown>(error)) {
    return new ApiError('request', 'An unexpected error occurred. Please try again.')
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new ApiError('timeout', 'The request took too long. Please try again.')
  }

  if (!error.response) {
    return new ApiError(
      'network',
      'Unable to reach SpaceTraders. Check your connection and try again.',
    )
  }

  const status = error.response.status
  const parsed = errorResponseSchema.safeParse(error.response.data)
  const code = parsed.success ? parsed.data.error.code : undefined
  const details = { status, code }

  if (code === 4105) {
    return new ApiError(
      'authentication',
      'This token has the wrong type. Use an agent token to connect.',
      details,
    )
  }

  if (status === 401) {
    return new ApiError(
      'authentication',
      'Your token is invalid or no longer accepted. Please reconnect.',
      details,
    )
  }

  if (status === 429) {
    return new ApiError(
      'rate-limit',
      'Too many requests. Please wait before trying again.',
      details,
    )
  }

  if (status >= 500) {
    return new ApiError(
      'server',
      'SpaceTraders is temporarily unavailable. Please try again later.',
      details,
    )
  }

  if (status === 403) {
    return new ApiError('request', 'You do not have permission to perform this action.', details)
  }

  return new ApiError('request', 'The request could not be completed. Please try again.', details)
}

export async function getJson(path: string, token: string, signal?: AbortSignal): Promise<unknown> {
  try {
    const response = await http.get<unknown>(path, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    })

    return response.data
  } catch (error: unknown) {
    if (axios.isCancel(error)) {
      throw error
    }

    throw normalizeError(error)
  }
}
