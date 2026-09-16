import { describe, expect, it } from 'vitest'

import { formatDuration, formatPercentage, percentage } from '../utils/ship-formatters'

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
})

describe('formatDuration', () => {
  it('formats seconds, minutes and hours', () => {
    expect(formatDuration(45)).toBe('45s')
    expect(formatDuration(125)).toBe('2m 5s')
    expect(formatDuration(3725)).toBe('1h 2m 5s')
  })
})
