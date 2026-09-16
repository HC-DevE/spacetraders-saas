import { describe, expect, it } from 'vitest'

import { getSystemSymbolFromWaypointSymbol } from '@/shared/utils/space-symbols'

describe('space symbols', () => {
  it('derives the system symbol from a waypoint symbol', () => {
    expect(getSystemSymbolFromWaypointSymbol('X1-HZ83-A1')).toBe('X1-HZ83')
  })

  it('returns undefined when a parent system cannot be derived', () => {
    expect(getSystemSymbolFromWaypointSymbol('INVALID')).toBeUndefined()
    expect(getSystemSymbolFromWaypointSymbol('X1-')).toBeUndefined()
    expect(getSystemSymbolFromWaypointSymbol('X1-A1')).toBeUndefined()
  })
})
