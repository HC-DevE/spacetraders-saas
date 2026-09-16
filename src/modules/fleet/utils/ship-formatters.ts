export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function percentage(current: number, capacity: number): number {
  if (capacity <= 0) {
    return 0
  }

  return Math.min(Math.max((current / capacity) * 100, 0), 100)
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const parts: string[] = []
  if (hours) parts.push(`${hours}h`)
  if (minutes) parts.push(`${minutes}m`)
  if (!parts.length || remainingSeconds) parts.push(`${remainingSeconds}s`)
  return parts.join(' ')
}
