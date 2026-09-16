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
  return value.toLowerCase().replace(/_/g, ' ')
}

export function formatDate(value: string | number): string {
  return `${dateFormatter.format(new Date(value))} UTC`
}
