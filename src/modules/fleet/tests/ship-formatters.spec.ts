import { describe, expect, it } from 'vitest'

import {
  formatDate,
  formatLabel,
  formatNumber,
  formatPercentage,
  percentage,
} from '../utils/ship-formatters'

describe('formatNumber', () => {
  it('formats integers with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000')
    expect(formatNumber(1000000)).toBe('1,000,000')
  })

  it('returns zero as-is', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('handles negative numbers', () => {
    expect(formatNumber(-500)).toBe('-500')
  })

  it('handles decimals', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56')
  })
})

describe('formatLabel', () => {
  it('converts snake_case to lowercase space-separated words', () => {
    expect(formatLabel('IN_TRANSIT')).toBe('in transit')
    expect(formatLabel('FRICTION_HEAT_SINK')).toBe('friction heat sink')
  })

  it('handles single word', () => {
    expect(formatLabel('DOCKED')).toBe('docked')
  })

  it('returns empty string for empty input', () => {
    expect(formatLabel('')).toBe('')
  })
})

describe('formatDate', () => {
  it('formats an ISO timestamp as date UTC', () => {
    const result = formatDate('2026-09-14T09:26:06.000Z')

    expect(result).toContain('UTC')
  })

  it('handles unix timestamp', () => {
    const result = formatDate(1757839566000)

    expect(result).toContain('UTC')
  })
})

describe('formatPercentage', () => {
  it('rounds to nearest whole percent', () => {
    expect(formatPercentage(0.49)).toBe('49%')
    expect(formatPercentage(0.51)).toBe('51%')
  })

  it('handles edge cases', () => {
    expect(formatPercentage(0)).toBe('0%')
    expect(formatPercentage(1)).toBe('100%')
  })
})

describe('percentage', () => {
  it('returns zero when capacity is zero', () => {
    expect(percentage(50, 0)).toBe(0)
  })

  it('returns the correct percentage', () => {
    expect(percentage(50, 100)).toBe(50)
    expect(percentage(75, 300)).toBe(25)
  })

  it('clamps to max 100', () => {
    expect(percentage(400, 300)).toBe(100)
  })

  it('handles edge case of 0/0', () => {
    expect(percentage(0, 0)).toBe(0)
  })
})
