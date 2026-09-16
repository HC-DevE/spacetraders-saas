import { z } from 'zod'

const identifierSchema = z.string().min(1)
const integerSchema = z.number().int()

export const waypointTypeSchema = z.enum([
  'PLANET',
  'GAS_GIANT',
  'MOON',
  'ORBITAL_STATION',
  'JUMP_GATE',
  'ASTEROID_FIELD',
  'ASTEROID',
  'ENGINEERED_ASTEROID',
  'ASTEROID_BASE',
  'NEBULA',
  'DEBRIS_FIELD',
  'GRAVITY_WELL',
  'ARTIFICIAL_GRAVITY_WELL',
  'FUEL_STATION',
])

export const waypointTraitSymbolSchema = z.enum([
  'UNCHARTED',
  'UNDER_CONSTRUCTION',
  'MARKETPLACE',
  'SHIPYARD',
  'OUTPOST',
  'SCATTERED_SETTLEMENTS',
  'SPRAWLING_CITIES',
  'MEGA_STRUCTURES',
  'PIRATE_BASE',
  'OVERCROWDED',
  'HIGH_TECH',
  'CORRUPT',
  'BUREAUCRATIC',
  'TRADING_HUB',
  'INDUSTRIAL',
  'BLACK_MARKET',
  'RESEARCH_FACILITY',
  'MILITARY_BASE',
  'SURVEILLANCE_OUTPOST',
  'EXPLORATION_OUTPOST',
  'MINERAL_DEPOSITS',
  'COMMON_METAL_DEPOSITS',
  'PRECIOUS_METAL_DEPOSITS',
  'RARE_METAL_DEPOSITS',
  'METHANE_POOLS',
  'ICE_CRYSTALS',
  'EXPLOSIVE_GASES',
  'STRONG_MAGNETOSPHERE',
  'VIBRANT_AURORAS',
  'SALT_FLATS',
  'CANYONS',
  'PERPETUAL_DAYLIGHT',
  'PERPETUAL_OVERCAST',
  'DRY_SEABEDS',
  'MAGMA_SEAS',
  'SUPERVOLCANOES',
  'ASH_CLOUDS',
  'VAST_RUINS',
  'MUTATED_FLORA',
  'TERRAFORMED',
  'EXTREME_TEMPERATURES',
  'EXTREME_PRESSURE',
  'DIVERSE_LIFE',
  'SCARCE_LIFE',
  'FOSSILS',
  'WEAK_GRAVITY',
  'STRONG_GRAVITY',
  'CRUSHING_GRAVITY',
  'TOXIC_ATMOSPHERE',
  'CORROSIVE_ATMOSPHERE',
  'BREATHABLE_ATMOSPHERE',
  'THIN_ATMOSPHERE',
  'JOVIAN',
  'ROCKY',
  'VOLCANIC',
  'FROZEN',
  'SWAMP',
  'BARREN',
  'TEMPERATE',
  'JUNGLE',
  'OCEAN',
  'RADIOACTIVE',
  'MICRO_GRAVITY_ANOMALIES',
  'DEBRIS_CLUSTER',
  'DEEP_CRATERS',
  'SHALLOW_CRATERS',
  'UNSTABLE_COMPOSITION',
  'HOLLOWED_INTERIOR',
  'STRIPPED',
])

const waypointModifierSymbolSchema = z.enum([
  'STRIPPED',
  'UNSTABLE',
  'RADIATION_LEAK',
  'CRITICAL_LIMIT',
  'CIVIL_UNREST',
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

export const waypointOrbitalSchema = z.object({
  symbol: identifierSchema,
})

const waypointFactionSchema = z.object({
  symbol: factionSymbolSchema,
})

const waypointTraitSchema = z.object({
  symbol: waypointTraitSymbolSchema,
  name: z.string(),
  description: z.string(),
})

const waypointModifierSchema = z.object({
  symbol: waypointModifierSymbolSchema,
  name: z.string(),
  description: z.string(),
})

const chartSchema = z.object({
  waypointSymbol: identifierSchema.optional(),
  submittedBy: z.string().optional(),
  submittedOn: z.string().datetime({ offset: true }).optional(),
})

export const waypointSchema = z.object({
  symbol: identifierSchema,
  type: waypointTypeSchema,
  systemSymbol: identifierSchema,

  x: integerSchema,
  y: integerSchema,

  orbitals: z.array(waypointOrbitalSchema),
  orbits: identifierSchema.optional(),

  faction: waypointFactionSchema.optional(),

  traits: z.array(waypointTraitSchema),
  modifiers: z.array(waypointModifierSchema).optional(),

  chart: chartSchema.optional(),

  isUnderConstruction: z.boolean(),
})

export const waypointResponseSchema = z.object({
  data: waypointSchema,
})

export type Waypoint = z.infer<typeof waypointSchema>
