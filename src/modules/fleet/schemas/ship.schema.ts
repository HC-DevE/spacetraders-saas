import { z } from 'zod'

// Valeurs communes

const integerSchema = z.number().int()
const quantitySchema = integerSchema.nonnegative()
const identifierSchema = z.string().min(1)
const dateTimeSchema = z.iso.datetime({ offset: true })
const componentRatioSchema = z.number().min(0).max(1)

// Énumérations

const shipRoleSchema = z.enum([
  'FABRICATOR',
  'HARVESTER',
  'HAULER',
  'INTERCEPTOR',
  'EXCAVATOR',
  'TRANSPORT',
  'REPAIR',
  'SURVEYOR',
  'COMMAND',
  'CARRIER',
  'PATROL',
  'SATELLITE',
  'EXPLORER',
  'REFINERY',
])

const shipNavStatusSchema = z.enum(['IN_TRANSIT', 'IN_ORBIT', 'DOCKED'])

const shipNavFlightModeSchema = z.enum(['DRIFT', 'STEALTH', 'CRUISE', 'BURN'])

const waypointTypeSchema = z.enum([
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

const shipFrameSymbolSchema = z.enum([
  'FRAME_PROBE',
  'FRAME_DRONE',
  'FRAME_INTERCEPTOR',
  'FRAME_RACER',
  'FRAME_FIGHTER',
  'FRAME_FRIGATE',
  'FRAME_SHUTTLE',
  'FRAME_EXPLORER',
  'FRAME_MINER',
  'FRAME_LIGHT_FREIGHTER',
  'FRAME_HEAVY_FREIGHTER',
  'FRAME_TRANSPORT',
  'FRAME_DESTROYER',
  'FRAME_CRUISER',
  'FRAME_CARRIER',
  'FRAME_BULK_FREIGHTER',
])

const shipReactorSymbolSchema = z.enum([
  'REACTOR_SOLAR_I',
  'REACTOR_FUSION_I',
  'REACTOR_FISSION_I',
  'REACTOR_CHEMICAL_I',
  'REACTOR_ANTIMATTER_I',
])

const shipEngineSymbolSchema = z.enum([
  'ENGINE_IMPULSE_DRIVE_I',
  'ENGINE_ION_DRIVE_I',
  'ENGINE_ION_DRIVE_II',
  'ENGINE_HYPER_DRIVE_I',
])

const shipModuleSymbolSchema = z.enum([
  'MODULE_MINERAL_PROCESSOR_I',
  'MODULE_GAS_PROCESSOR_I',
  'MODULE_CARGO_HOLD_I',
  'MODULE_CARGO_HOLD_II',
  'MODULE_CARGO_HOLD_III',
  'MODULE_CREW_QUARTERS_I',
  'MODULE_ENVOY_QUARTERS_I',
  'MODULE_PASSENGER_CABIN_I',
  'MODULE_MICRO_REFINERY_I',
  'MODULE_ORE_REFINERY_I',
  'MODULE_FUEL_REFINERY_I',
  'MODULE_SCIENCE_LAB_I',
  'MODULE_JUMP_DRIVE_I',
  'MODULE_JUMP_DRIVE_II',
  'MODULE_JUMP_DRIVE_III',
  'MODULE_WARP_DRIVE_I',
  'MODULE_WARP_DRIVE_II',
  'MODULE_WARP_DRIVE_III',
  'MODULE_SHIELD_GENERATOR_I',
  'MODULE_SHIELD_GENERATOR_II',
])

const shipMountSymbolSchema = z.enum([
  'MOUNT_GAS_SIPHON_I',
  'MOUNT_GAS_SIPHON_II',
  'MOUNT_GAS_SIPHON_III',
  'MOUNT_SURVEYOR_I',
  'MOUNT_SURVEYOR_II',
  'MOUNT_SURVEYOR_III',
  'MOUNT_SENSOR_ARRAY_I',
  'MOUNT_SENSOR_ARRAY_II',
  'MOUNT_SENSOR_ARRAY_III',
  'MOUNT_MINING_LASER_I',
  'MOUNT_MINING_LASER_II',
  'MOUNT_MINING_LASER_III',
  'MOUNT_LASER_CANNON_I',
  'MOUNT_MISSILE_LAUNCHER_I',
  'MOUNT_TURRET_I',
])

const depositSymbolSchema = z.enum([
  'QUARTZ_SAND',
  'SILICON_CRYSTALS',
  'PRECIOUS_STONES',
  'ICE_WATER',
  'AMMONIA_ICE',
  'IRON_ORE',
  'COPPER_ORE',
  'SILVER_ORE',
  'ALUMINUM_ORE',
  'GOLD_ORE',
  'PLATINUM_ORE',
  'DIAMONDS',
  'URANITE_ORE',
  'MERITIUM_ORE',
])

const tradeSymbolSchema = z.enum([
  'PRECIOUS_STONES',
  'QUARTZ_SAND',
  'SILICON_CRYSTALS',
  'AMMONIA_ICE',
  'LIQUID_HYDROGEN',
  'LIQUID_NITROGEN',
  'ICE_WATER',
  'EXOTIC_MATTER',
  'ADVANCED_CIRCUITRY',
  'GRAVITON_EMITTERS',
  'IRON',
  'IRON_ORE',
  'COPPER',
  'COPPER_ORE',
  'ALUMINUM',
  'ALUMINUM_ORE',
  'SILVER',
  'SILVER_ORE',
  'GOLD',
  'GOLD_ORE',
  'PLATINUM',
  'PLATINUM_ORE',
  'DIAMONDS',
  'URANITE',
  'URANITE_ORE',
  'MERITIUM',
  'MERITIUM_ORE',
  'HYDROCARBON',
  'ANTIMATTER',
  'FAB_MATS',
  'FERTILIZERS',
  'FABRICS',
  'FOOD',
  'JEWELRY',
  'MACHINERY',
  'FIREARMS',
  'ASSAULT_RIFLES',
  'MILITARY_EQUIPMENT',
  'EXPLOSIVES',
  'LAB_INSTRUMENTS',
  'AMMUNITION',
  'ELECTRONICS',
  'SHIP_PLATING',
  'SHIP_PARTS',
  'EQUIPMENT',
  'FUEL',
  'MEDICINE',
  'DRUGS',
  'CLOTHING',
  'MICROPROCESSORS',
  'PLASTICS',
  'POLYNUCLEOTIDES',
  'BIOCOMPOSITES',
  'QUANTUM_STABILIZERS',
  'NANOBOTS',
  'AI_MAINFRAMES',
  'QUANTUM_DRIVES',
  'ROBOTIC_DRONES',
  'CYBER_IMPLANTS',
  'GENE_THERAPEUTICS',
  'NEURAL_CHIPS',
  'MOOD_REGULATORS',
  'VIRAL_AGENTS',
  'MICRO_FUSION_GENERATORS',
  'SUPERGRAINS',
  'LASER_RIFLES',
  'HOLOGRAPHICS',
  'SHIP_SALVAGE',
  'RELIC_TECH',
  'NOVEL_LIFEFORMS',
  'BOTANICAL_SPECIMENS',
  'CULTURAL_ARTIFACTS',

  ...shipFrameSymbolSchema.options,
  ...shipReactorSymbolSchema.options,
  ...shipEngineSymbolSchema.options,
  ...shipModuleSymbolSchema.options,
  ...shipMountSymbolSchema.options,

  'SHIP_PROBE',
  'SHIP_MINING_DRONE',
  'SHIP_SIPHON_DRONE',
  'SHIP_INTERCEPTOR',
  'SHIP_LIGHT_HAULER',
  'SHIP_COMMAND_FRIGATE',
  'SHIP_EXPLORER',
  'SHIP_HEAVY_FREIGHTER',
  'SHIP_LIGHT_SHUTTLE',
  'SHIP_ORE_HOUND',
  'SHIP_REFINING_FREIGHTER',
  'SHIP_SURVEYOR',
  'SHIP_BULK_FREIGHTER',
])

// Enregistrement

const shipRegistrationSchema = z.object({
  name: identifierSchema,
  factionSymbol: identifierSchema,
  role: shipRoleSchema,
})

// Navigation

const shipNavRouteWaypointSchema = z.object({
  symbol: identifierSchema,
  type: waypointTypeSchema,
  systemSymbol: identifierSchema,
  x: integerSchema,
  y: integerSchema,
})

const shipNavRouteSchema = z.object({
  destination: shipNavRouteWaypointSchema,
  origin: shipNavRouteWaypointSchema,
  departureTime: dateTimeSchema,
  arrival: dateTimeSchema,
})

const shipNavSchema = z.object({
  systemSymbol: identifierSchema,
  waypointSymbol: identifierSchema,
  route: shipNavRouteSchema,
  status: shipNavStatusSchema,
  flightMode: shipNavFlightModeSchema,
})

// Équipage

const shipCrewSchema = z.object({
  current: integerSchema,
  required: integerSchema,
  capacity: integerSchema,
  rotation: z.enum(['STRICT', 'RELAXED']),
  morale: integerSchema.min(0).max(100),
  wages: quantitySchema,
})

// Prérequis et caractéristiques communes des équipements principaux

const shipRequirementsSchema = z.object({
  power: integerSchema.optional(),
  crew: integerSchema.optional(),
  slots: integerSchema.optional(),
})

const shipComponentSchema = z.object({
  name: z.string(),
  description: z.string(),
  condition: componentRatioSchema,
  integrity: componentRatioSchema,
  quality: integerSchema,
  requirements: shipRequirementsSchema,
})

// Châssis, réacteur et moteur

const shipFrameSchema = shipComponentSchema.extend({
  symbol: shipFrameSymbolSchema,
  moduleSlots: quantitySchema,
  mountingPoints: quantitySchema,
  fuelCapacity: quantitySchema,
})

const shipReactorSchema = shipComponentSchema.extend({
  symbol: shipReactorSymbolSchema,
  powerOutput: integerSchema.min(1),
})

const shipEngineSchema = shipComponentSchema.extend({
  symbol: shipEngineSymbolSchema,
  speed: integerSchema.min(1),
})

// Modules et montages

const shipModuleSchema = z.object({
  symbol: shipModuleSymbolSchema,
  name: z.string(),
  description: z.string(),
  requirements: shipRequirementsSchema,
  capacity: quantitySchema.optional(),
  range: quantitySchema.optional(),
})

const shipMountSchema = z.object({
  symbol: shipMountSymbolSchema,
  name: z.string(),
  description: z.string().optional(),
  requirements: shipRequirementsSchema,
  strength: quantitySchema.optional(),
  deposits: z.array(depositSymbolSchema).optional(),
})

// Cargaison

const shipCargoItemSchema = z.object({
  symbol: tradeSymbolSchema,
  name: z.string(),
  description: z.string(),
  units: integerSchema.min(1),
})

const shipCargoSchema = z.object({
  capacity: quantitySchema,
  units: quantitySchema,
  inventory: z.array(shipCargoItemSchema),
})

// Carburant

const shipFuelSchema = z.object({
  current: quantitySchema,
  capacity: quantitySchema,

  consumed: z
    .object({
      amount: quantitySchema,
      timestamp: dateTimeSchema,
    })
    .optional(),
})

// Cooldown

const shipCooldownSchema = z.object({
  shipSymbol: identifierSchema,
  totalSeconds: quantitySchema,
  remainingSeconds: quantitySchema,
  expiration: dateTimeSchema.optional(),
})

// Modèle complet du vaisseau

export const shipSchema = z.object({
  symbol: z.string(),
  registration: shipRegistrationSchema,
  nav: shipNavSchema,
  crew: shipCrewSchema,
  frame: shipFrameSchema,
  reactor: shipReactorSchema,
  engine: shipEngineSchema,
  modules: z.array(shipModuleSchema),
  mounts: z.array(shipMountSchema),
  cargo: shipCargoSchema,
  fuel: shipFuelSchema,
  cooldown: shipCooldownSchema,
})

// Réponse de GET /my/ships/{shipSymbol}

export const shipResponseSchema = z.object({
  data: shipSchema,
})

export type Ship = z.infer<typeof shipSchema>
