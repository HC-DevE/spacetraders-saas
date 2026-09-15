import type { Ship } from '../schemas/ship.schema'

export function formatShipStatus(status: Ship['nav']['status'] | undefined): {
  label: string
  className: string
} {
  switch (status) {
    case 'DOCKED':
      return { label: 'Docked', className: 'bg-success-subtle text-success' }

    case 'IN_ORBIT':
      return { label: 'In orbit', className: 'bg-secondary text-secondary-foreground' }

    case 'IN_TRANSIT':
      return { label: 'In transit', className: 'bg-warning-subtle text-warning' }

    default:
      return { label: 'Unknown status', className: 'bg-muted text-muted-foreground' }
  }
}
