export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'https://api.spacetraders.io/v2',
} as const
