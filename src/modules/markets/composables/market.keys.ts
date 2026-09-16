export const marketKeys = {
  detail: (systemSymbol: string, waypointSymbol: string) =>
    ['markets', 'detail', systemSymbol, waypointSymbol] as const,
}
