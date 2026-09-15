const numberFormatter = new Intl.NumberFormat('en-US')

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatLabel(value: string): string {
  // ASCII-only input is guaranteed — all enum values from the SpaceTraders API are uppercase ASCII
  return value.toLowerCase().replace(/_/g, ' ')
}

export function formatDate(value: string | number): string {
  return `${dateFormatter.format(new Date(value))} UTC`
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function percentage(current: number, capacity: number): number {
  if (capacity === 0) return 0

  return Math.min(100, Math.max(0, (current / capacity) * 100))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60

  if (hours > 0) return `${hours}h ${minutes}m ${remainder}s`
  if (minutes > 0) return `${minutes}m ${remainder}s`

  return `${remainder}s`
}
