import { describe, expect, it } from 'vitest'

import { formatShipStatus } from '../utils/ship-status'

describe('formatShipStatus', () => {
  it('returns Docked for DOCKED status', () => {
    expect(formatShipStatus('DOCKED')).toEqual({
      label: 'Docked',
      className: 'bg-success-subtle text-success',
    })
  })

  it('returns In orbit for IN_ORBIT status', () => {
    expect(formatShipStatus('IN_ORBIT')).toEqual({
      label: 'In orbit',
      className: 'bg-secondary text-secondary-foreground',
    })
  })

  it('returns In transit for IN_TRANSIT status', () => {
    expect(formatShipStatus('IN_TRANSIT')).toEqual({
      label: 'In transit',
      className: 'bg-warning-subtle text-warning',
    })
  })

  it('returns Unknown status when the status is unavailable', () => {
    expect(formatShipStatus(undefined)).toEqual({
      label: 'Unknown status',
      className: 'bg-muted text-muted-foreground',
    })
  })
})
