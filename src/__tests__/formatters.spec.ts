import { describe, expect, it } from 'vitest'

import { formatDate, formatLabel, formatNumber } from '@/shared/utils/formatters'

describe('shared formatters', () => {
  it('formats numbers with en-US separators', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1234.56)).toBe('1,234.56')
    expect(formatNumber(-500)).toBe('-500')
  })

  it('formats enum labels', () => {
    expect(formatLabel('IN_TRANSIT')).toBe('in transit')
    expect(formatLabel('FRICTION_HEAT_SINK')).toBe('friction heat sink')
    expect(formatLabel('')).toBe('')
  })

  it('formats ISO and numeric timestamps in UTC', () => {
    expect(formatDate('2026-09-14T09:26:06.000Z')).toContain('UTC')
    expect(formatDate(1757839566000)).toContain('UTC')
  })
})
