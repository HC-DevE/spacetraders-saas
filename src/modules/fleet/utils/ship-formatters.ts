export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}

export function percentage(current: number, capacity: number): number {
  if (capacity <= 0) {
    return 0
  }

  return Math.min(Math.max(current / capacity, 0), 1)
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (!minutes) {
    return `${remainingSeconds}s`
  }

  if (!remainingSeconds) {
    return `${minutes}m`
  }

  return `${minutes}m ${remainingSeconds}s`
}
