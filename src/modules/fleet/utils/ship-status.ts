import type { Ship } from '../schemas/ship.schema'

export function formatShipStatus(status: Ship['nav']['status'] | undefined): {
  label: string
  className: string
} {
  switch (status) {
    case 'DOCKED':
      return {
        label: 'Docked',
        className: 'text-muted-foreground',
      }

    case 'IN_ORBIT':
      return {
        label: 'In orbit',
        className: 'text-orbit',
      }

    case 'IN_TRANSIT':
      return {
        label: 'In transit',
        className: 'text-signal',
      }

    default:
      return {
        label: 'Unknown status',
        className: 'text-muted-foreground',
      }
  }
}
