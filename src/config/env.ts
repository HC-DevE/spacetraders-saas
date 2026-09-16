import { SPACE_TRADERS_DEFAULT_API_BASE_URL } from './space-traders'

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

export const env = {
  apiBaseUrl: normalizeUrl(configuredApiBaseUrl || SPACE_TRADERS_DEFAULT_API_BASE_URL),
} as const
