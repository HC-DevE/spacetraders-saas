# Space Control — SpaceTraders SaaS

Interface frontend Vue 3 / TypeScript construite autour de l’API SpaceTraders dans le cadre du test technique Frontend Evertrust.

Le projet privilégie des parcours complets, robustes et testés plutôt qu’une couverture partielle de toute l’API.

Le parcours principal est :

```text
Login
→ Agent
→ Fleet / Systems
→ Ship / Waypoint
→ Market
```

---

## Live demos

Two versions of the project are available online:

| Version | Focus                                                        | Demo                                                        |
| ------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| V1      | Initial functional vertical slice                            | [Open V1](https://spacetraders-saas.vercel.app/)            |
| V2      | Refined UI, shared data tables, navigation and design system | [Open V2](https://spacetraders-saas-redesigned.vercel.app/) |

The V2 keeps the same functional foundation while refining the application shell,
data presentation, responsive behavior, accessibility and shared UI architecture.

---

## Fonctionnalités

| Domaine    | Fonctionnalités                                                   |
| ---------- | ----------------------------------------------------------------- |
| Auth       | Validation du token, session persistée, restauration, logout      |
| Agent      | Informations de l’agent courant et navigation vers ses ressources |
| Fleet      | Liste paginée des vaisseaux et détail complet d’un ship           |
| Systems    | Liste paginée et détail d’un système                              |
| Waypoints  | Pagination, filtre Marketplace et détail d’un waypoint            |
| Markets    | Ressources, prix disponibles et transactions                      |
| Navigation | Liens entre Agent, Fleet, Systems, Waypoints et Markets           |
| Feedback   | Loading, empty, offline, refresh, refresh error, 404              |
| Quality    | Zod, Vitest, MSW, Playwright, lint, types et build                |

Le périmètre actuel est principalement **read-only**.

Les mutations Fleet, le trading et la planification commerciale ne sont pas implémentés.

---

## V1 → V2

Le projet a été développé en deux passes principales.

### V1

La première version s’est concentrée sur la livraison des parcours fonctionnels :

```text
authentication
agent
fleet
systems
waypoints
markets
tests
CI
```

L’objectif était d’obtenir rapidement une vertical slice complète et fiable.

### V2

La seconde passe s’est concentrée sur la cohérence produit et l’architecture de présentation :

```text
application shell
AppHeader
AppNavigation
centralized navigation metadata
shared DataTable
Fleet table
Systems table
Waypoints table
Market tables
responsive data display
Lucide icons
visual language
Design System
documentation
```

Cette seconde passe ne remplace pas l’architecture fonctionnelle de la V1.

Elle la consolide autour de primitives et conventions réellement partagées.

---

# Stack

## Core

- Vue 3
- TypeScript
- Composition API
- Vue Router
- Vite

## State and data

- Pinia
- TanStack Vue Query
- Axios
- Zod

## UI

- Tailwind CSS
- shadcn-vue
- TanStack Table
- Lucide Vue

## Tests

- Vitest
- Vue Test Utils
- MSW
- Playwright

## Quality

- Oxlint
- ESLint
- Prettier
- vue-tsc
- GitHub Actions

Les versions exactes sont déclarées dans :

```text
package.json
pnpm-lock.yaml
```

---

# Prérequis

Le projet utilise actuellement :

```text
Node.js 24.14.0
pnpm 12.4.1
```

Le `package.json` accepte également :

```text
Node ^22.18.0
ou
Node >=24.12.0
```

Un token d’agent SpaceTraders est nécessaire pour utiliser l’application.

---

# Installation

Depuis la racine du dépôt :

```bash
pnpm install --frozen-lockfile
```

Puis :

```bash
pnpm dev
```

Vite affiche ensuite l’URL locale de développement.

---

# Build

```bash
pnpm build
```

Le build exécute :

```text
vue-tsc
+
Vite build
```

Pour tester le build localement :

```bash
pnpm preview
```

---

# Token SpaceTraders

L’application attend un token d’agent SpaceTraders.

Le token est saisi directement dans l’interface Login.

Il ne doit pas être préfixé manuellement avec :

```text
Bearer
```

La connexion vérifie le token via :

```text
GET /my/agent
```

Un token rejeté n’est pas enregistré.

Aucun token réel ne doit être présent dans :

```text
repository
fixtures
logs
screenshots
versioned environment files
```

---

# Architecture

Le projet utilise une architecture orientée fonctionnalités.

```text
.
├── docs/
│   ├── architecture.md
│   ├── design-system.md
│   └── features/
│       ├── auth.md
│       ├── fleet.md
│       ├── systems.md
│       └── markets.md
│
├── e2e/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── navigation/
│   │   ├── pages/
│   │   ├── providers/
│   │   └── router/
│   │
│   ├── config/
│   │
│   ├── modules/
│   │   ├── agent/
│   │   ├── auth/
│   │   ├── fleet/
│   │   ├── markets/
│   │   └── systems/
│   │
│   ├── shared/
│   │   ├── api/
│   │   ├── components/
│   │   ├── schemas/
│   │   ├── styles/
│   │   └── utils/
│   │
│   └── __tests__/
│
└── .github/
    └── workflows/
```

Les modules regroupent les responsabilités métier.

```text
auth
→ session frontend

agent
→ agent courant

fleet
→ ships

systems
→ systems + waypoints

markets
→ marketplace data
```

Les composants génériques restent dans `shared` uniquement lorsqu’un véritable besoin commun existe.

---

# Application shell

Les routes authentifiées utilisent :

```text
AppLayout
├── AppHeader
├── AppNavigation
└── RouterView
```

Le shell est indépendant des modules métier.

`AppHeader` affiche uniquement :

```text
branding
agent symbol
sign out
```

L’objet Agent complet n’est pas chargé depuis le header.

---

# Navigation

Les sections principales sont centralisées dans :

```text
src/app/navigation/main-navigation.ts
```

Les routes utilisent :

```text
meta.navigationSection
```

afin de conserver la bonne section active sur les routes imbriquées.

Exemple :

```text
/fleet
/fleet/TEST-1

→ Fleet
```

et :

```text
/systems
/systems/X1-TEST
/systems/X1-TEST/waypoints/X1-TEST-A1
/.../market

→ Systems
```

---

# State management

## Pinia

Pinia contient uniquement l’état local de session :

```text
token
agentSymbol
hasToken
```

`agentSymbol` est un snapshot léger utilisé par le shell.

Il ne remplace pas l’objet Agent complet.

---

## TanStack Query

Les ressources SpaceTraders restent du server state :

```text
Agent
Ships
Systems
Waypoints
Markets
```

Les principales query keys sont :

```ts
;['agent', 'current'][('ships', 'list', { page, limit })][('ships', 'detail', symbol)][
  ('systems', 'list', { page, limit })
][('systems', 'detail', systemSymbol)][('waypoints', 'list', systemSymbol, params)][
  ('waypoints', 'detail', systemSymbol, waypointSymbol)
][('markets', 'detail', systemSymbol, waypointSymbol)]
```

Le token n’est pas inclus dans les query keys.

Le cache est nettoyé lors d’un changement de session.

---

# API boundary

Les fonctions API restent indépendantes de Vue et Pinia.

Exemples :

```ts
getAgent(token)

getShips(token, params, signal)
getShip(token, symbol, signal)

getSystems(token, params, signal)
getSystem(token, systemSymbol, signal)

getWaypoints(token, systemSymbol, params, signal)
getWaypoint(token, systemSymbol, waypointSymbol, signal)

getMarket(token, systemSymbol, waypointSymbol, signal)
```

Les dépendances sont explicites.

---

# Runtime validation

Les réponses SpaceTraders sont validées avec Zod avant d’être exposées aux composants.

Les types TypeScript sont dérivés autant que possible des schémas :

```ts
type Ship = z.infer<typeof shipSchema>
```

L’application vérifie également la cohérence de certaines ressources.

Exemple :

```text
GET /my/ships/TEST-1

→ Ship.symbol doit être TEST-1
```

Une réponse incohérente produit :

```text
invalid-response
```

et n’est pas affichée silencieusement.

---

# Shared DataTable

La V2 utilise une base commune :

```text
src/shared/components/table/
├── DataTable.vue
└── data-table.ts
```

Elle est utilisée par :

```text
ShipTable
SystemTable
WaypointTable
MarketGoodsTable
MarketTransactionsTable
```

`DataTable` possède uniquement les responsabilités communes :

```text
semantic <table>
header rendering
cell rendering
alignment
column metadata
aria-label
aria-busy
horizontal overflow
placeholder dimming
```

Les features continuent de posséder :

```text
columns
pagination
queries
filters
navigation
business rendering
```

---

# Tables versus cards

La règle générale est :

```text
homogeneous comparable collection
→ table
```

et :

```text
heterogeneous descriptive information
→ independent cards / surfaces
```

Exemples :

```text
Fleet
→ table

Ship modules
→ cards

Waypoints
→ table

Waypoint traits
→ cards
```

`ShipCard` et `SystemCard` restent présents pour permettre éventuellement une future vue :

```text
Cards
↔
Table
```

sans reconstruire ces composants.

---

# Fleet

La page Fleet présente les ships dans une table paginée.

Elle expose notamment :

```text
Ship
Role
Status
Location
Fuel
Cargo
```

Les liens permettent d’ouvrir :

```text
Ship detail
System detail
Waypoint detail
```

Lorsqu’un vaisseau est en transit, la table présente :

```text
Destination
Expected arrival
```

Le détail Ship couvre notamment :

```text
resources
navigation
crew
cooldown
cargo
equipment
modules
mounts
```

---

# Systems and waypoints

Systems utilise également une table paginée.

Le détail d’un système charge séparément :

```text
System
+
Waypoints
```

La liste Waypoints propose actuellement :

```text
Marketplace only
```

comme filtre métier.

La page détail Waypoint présente notamment :

```text
overview
traits
modifiers
orbitals
chart
marketplace status
```

Un waypoint :

```text
UNCHARTED
```

peut avoir un statut Marketplace :

```text
Unknown
```

car ses véritables traits peuvent ne pas encore être connus.

---

# Markets

La page Market présente :

```text
Resources
Trade prices
Recent transactions
```

Les ressources structurelles sont séparées en :

```text
Exports
Imports
Exchange
```

Les données détaillées conservent la différence entre :

```text
undefined
```

et :

```text
[]
```

Exemple :

```text
tradeGoods === undefined
→ Detailed prices unavailable

tradeGoods = []
→ No priced goods reported
```

Les transactions affichent le `shipSymbol` comme donnée technique.

Il n’est pas transformé automatiquement en lien Fleet car le contrat ne garantit pas que ce ship appartienne à la session active.

---

# URL state

Les états de navigation utiles sont conservés dans l’URL.

Exemples :

```text
/fleet?page=2&limit=10

/systems?page=2&limit=20

/systems/X1-TEST?page=2&limit=10&marketplace=true
```

Le frontend conserve une URL orientée intention utilisateur.

Par exemple :

```text
marketplace=true
```

est traduit par la couche API vers :

```text
traits=MARKETPLACE
```

---

# Refresh behavior

Une différence est faite entre :

```text
initial loading
```

et :

```text
refreshing existing data
```

Lorsqu’une actualisation échoue après un chargement réussi :

```text
last successful data
+
refresh warning
```

restent visibles.

L’application ne supprime pas inutilement une information valide.

---

# Design system

La direction visuelle V2 privilégie :

```text
flat surfaces
thin borders
limited shadows
limited radius
dense structured information
technical typography
semantic tables
```

Palette principale :

```text
Ink
Panel
Signal
Orbit
Alert
Paper
```

Typographies :

```text
IBM Plex Sans
IBM Plex Mono
```

La route :

```text
/design-system
```

est disponible uniquement en développement.

Elle présente directement les vraies primitives du projet :

```text
Foundations
Actions
Inputs
Feedback
Data display
Structured surfaces
```

Elle utilise notamment le véritable :

```text
AppButton
Input
Label
FeedbackState
DataTable
```

et ne recrée pas une seconde fausse application.

---

# Accessibility

Plusieurs conventions sont intégrées directement dans les composants :

```text
semantic tables
skip link
aria-current
aria-label
aria-busy
aria-invalid
aria-describedby
aria-controls
aria-pressed
role="alert"
role="status"
visible focus
```

Les noms accessibles servent également autant que possible de contrat pour les E2E.

Exemples :

```text
Open ship TEST-1
Open system X1-TEST
View waypoint X1-TEST-A1
Open waypoint market
Back to waypoint
```

---

# Tests

La stratégie combine plusieurs niveaux.

## Unit

Les fonctions pures sont testées avec Vitest.

Exemples :

```text
formatters
ship status
waypoint status
symbol parsing
```

## Integration

Vue Test Utils et MSW couvrent :

```text
Vue
Router
Pinia
TanStack Query
mocked API
```

Ces tests vérifient notamment :

```text
pagination
filters
navigation
loading
empty states
invalid responses
refresh errors
authentication transitions
```

## End-to-end

Playwright couvre deux parcours principaux :

```text
Login
→ Agent
→ Fleet
→ Ship
→ Logout
```

et :

```text
Login
→ Systems
→ System
→ Waypoint
→ Market
→ back navigation
```

---

# Quality checks

Pour exécuter toutes les vérifications principales :

```bash
pnpm check
```

Cette commande exécute :

```text
Oxlint
ESLint
Prettier check
Vitest
vue-tsc
Vite build
```

Les E2E sont exécutés séparément :

```bash
pnpm test:e2e
```

---

# CI

GitHub Actions exécute :

```text
pnpm install --frozen-lockfile
    ↓
pnpm check
    ↓
Prettier + TypeScript checks for E2E
    ↓
Playwright Chromium installation
    ↓
pnpm test:e2e
    ↓
Playwright report artifact
```

La CI s’exécute sur :

```text
push
pull request
manual dispatch
```

---

# Documentation

La documentation détaillée se trouve dans :

- [Architecture](docs/architecture.md)
- [Design system](docs/design-system.md)
- [Authentication](docs/features/auth.md)
- [Fleet](docs/features/fleet.md)
- [Systems and waypoints](docs/features/systems.md)
- [Markets](docs/features/markets.md)

Le README reste volontairement une vue d’ensemble.

Les choix détaillés sont documentés dans les fichiers spécialisés afin d’éviter de maintenir plusieurs fois la même explication.

---

# Scope volontairement non implémenté

La version actuelle ne couvre pas notamment :

```text
ship mutations
trading
commercial planning
real-time notifications
advanced waypoint filters
global search
interactive sorting
price history
market comparison
galaxy map
persistent Cards/Table preference
```

Ces fonctionnalités pourront être ajoutées lorsque leur besoin est réel.

L’objectif actuel reste de conserver une base :

```text
cohérente
testée
maintenable
documentée
```

sans introduire prématurément des couches ou comportements supplémentaires.

---

# Evolutions possibles

Les prochaines évolutions naturelles seraient notamment :

```text
Cards / Table view
persisted display preferences
advanced search
sorting
additional waypoint filters
Fleet actions
Market trading
price history
market comparison
real-time updates
automated accessibility checks
```

Elles doivent continuer à respecter les mêmes principes :

```text
KISS
YAGNI
explicit dependencies
server state in TanStack Query
runtime validation at API boundaries
shared abstractions only after real reuse
```
