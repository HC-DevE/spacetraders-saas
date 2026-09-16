import { z } from 'zod'
import { waypointOrbitalSchema, waypointTypeSchema } from './waypoint.schema'

// Valeurs communes

const integerSchema = z.number().int()
const identifierSchema = z.string().min(1)

// Énumérations

const systemTypeSchema = z.enum([
  'NEUTRON_STAR',
  'RED_STAR',
  'ORANGE_STAR',
  'BLUE_STAR',
  'YOUNG_STAR',
  'WHITE_DWARF',
  'BLACK_HOLE',
  'HYPERGIANT',
  'NEBULA',
  'UNSTABLE',
])

const factionSymbolSchema = z.enum([
  'COSMIC',
  'VOID',
  'GALACTIC',
  'QUANTUM',
  'DOMINION',
  'ASTRO',
  'CORSAIRS',
  'OBSIDIAN',
  'AEGIS',
  'UNITED',
  'SOLITARY',
  'COBALT',
  'OMEGA',
  'ECHO',
  'LORDS',
  'CULT',
  'ANCIENTS',
  'SHADOW',
  'ETHEREAL',
])

// Waypoints résumés contenus dans un système

const systemWaypointSchema = z.object({
  symbol: identifierSchema,
  type: waypointTypeSchema,
  x: integerSchema,
  y: integerSchema,
  orbitals: z.array(waypointOrbitalSchema),
  orbits: identifierSchema.optional(),
})

// Factions présentes dans le système

const systemFactionSchema = z.object({
  symbol: factionSymbolSchema,
})

// Modèle complet du système

export const systemSchema = z.object({
  symbol: identifierSchema,
  sectorSymbol: identifierSchema,
  constellation: z.string().optional(),
  name: z.string().optional(),
  type: systemTypeSchema,
  x: integerSchema,
  y: integerSchema,
  waypoints: z.array(systemWaypointSchema),
  factions: z.array(systemFactionSchema),
})

export const systemResponseSchema = z.object({
  data: systemSchema,
})

export type System = z.infer<typeof systemSchema>
