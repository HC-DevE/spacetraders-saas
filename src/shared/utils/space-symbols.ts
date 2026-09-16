export function getSystemSymbolFromWaypointSymbol(waypointSymbol: string): string | undefined {
  const parts = waypointSymbol.split('-')

  if (parts.length < 3 || parts.some((part) => part.length === 0)) {
    return undefined
  }

  return parts.slice(0, -1).join('-')
}
