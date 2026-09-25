import { describe, expect, it } from 'vitest'

import { formatShipStatus } from '../utils/ship-status'

describe('formatShipStatus', () => {
  it('returns Docked for DOCKED status', () => {
    expect(formatShipStatus('DOCKED')).toEqual({
      label: 'Docked',
      className: 'text-muted-foreground',
    })
  })

  it('returns In orbit for IN_ORBIT status', () => {
    expect(formatShipStatus('IN_ORBIT')).toEqual({
      label: 'In orbit',
      className: 'text-orbit',
    })
  })

  it('returns In transit for IN_TRANSIT status', () => {
    expect(formatShipStatus('IN_TRANSIT')).toEqual({
      label: 'In transit',
      className: 'text-signal',
    })
  })

  it('returns Unknown status when the status is unavailable', () => {
    expect(formatShipStatus(undefined)).toEqual({
      label: 'Unknown status',
      className: 'text-muted-foreground',
    })
  })
})
