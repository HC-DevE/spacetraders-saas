# Architecture

## Objectif

Space Control est une application frontend Vue 3 construite autour de l’API SpaceTraders.

L’architecture vise à conserver un projet :

- lisible par fonctionnalité ;
- simple à faire évoluer ;
- strict sur les données externes ;
- explicite sur la séparation entre état local et état serveur ;
- testable sans dépendances cachées ;
- cohérent entre les différents parcours de l’application ;
- pragmatique dans ses abstractions.

Le projet privilégie une architecture **feature-based** et des abstractions introduites lorsqu’un besoin partagé existe réellement.

Il ne cherche pas à reproduire une architecture backend complète dans le frontend.

---

## Organisation générale

La documentation se trouve volontairement hors du code applicatif.

```text
.
├── docs/
│   ├── architecture.md
│   └── features/
│       ├── auth.md
│       ├── fleet.md
│       ├── systems.md
│       └── markets.md
│
├── e2e/
│   ├── agent-fleet.spec.ts
│   ├── systems-market.spec.ts
│   └── tsconfig.json
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
│   │   │   ├── feedback/
│   │   │   ├── table/
│   │   │   └── ui/
│   │   ├── schemas/
│   │   ├── styles/
│   │   └── utils/
│   │
│   └── __tests__/
│
└── .github/
    └── workflows/
        └── ci.yml
```

Les modules correspondent à des responsabilités fonctionnelles :

```text
auth
→ connexion et cycle de vie de la session

agent
→ informations de l’agent courant

fleet
→ flotte et détail des vaisseaux

systems
→ systèmes, waypoints et exploration

markets
→ données commerciales d’un waypoint
```

Cette organisation est orientée produit et non structure d’URL.

Par exemple, l’endpoint Market est techniquement imbriqué sous `/systems`, mais la responsabilité commerciale reste suffisamment distincte pour justifier le module `markets`.

---

# Responsabilité des couches

Dans un module fonctionnel :

| Dossier        | Responsabilité                                             |
| -------------- | ---------------------------------------------------------- |
| `api/`         | Appels HTTP, validation et cohérence des réponses          |
| `schemas/`     | Schémas Zod et types TypeScript dérivés                    |
| `composables/` | TanStack Query, mutations et logique réactive réutilisable |
| `pages/`       | Paramètres de route, états d’écran et composition          |
| `components/`  | Présentation d’une responsabilité délimitée                |
| `utils/`       | Fonctions pures propres au domaine du module               |
| `tests/`       | Fixtures et tests du comportement                          |

Une page ou un composant ne doit pas devenir un point de concentration pour :

```text
HTTP
+
validation runtime
+
cache
+
règles métier
+
navigation
+
formatage générique
+
présentation
```

Chaque responsabilité reste au niveau le plus simple qui permet de la comprendre et de la tester.

---

# Application shell

Les routes authentifiées partagent le même shell.

```text
AppLayout
├── AppHeader
├── AppNavigation
└── RouterView
```

`AppLayout` est responsable de la structure globale de l’interface.

Il fournit notamment :

- le header ;
- la navigation principale ;
- le conteneur de contenu ;
- le skip link d’accessibilité ;
- la redirection vers le login lorsqu’une session disparaît.

Il ne connaît pas les détails métier de Fleet, Systems ou Markets.

---

## AppHeader

`AppHeader` présente uniquement les informations globales nécessaires :

```text
branding
+
agent symbol
+
sign out
```

L’agent complet n’est pas chargé depuis le header.

Le symbole affiché provient du snapshot `agentSymbol` conservé dans le store d’authentification.

Cela évite qu’un composant présent sur toutes les pages déclenche systématiquement une query `/my/agent`.

Le vrai objet `Agent` reste du server state géré par TanStack Query.

---

# Navigation principale

La navigation est centralisée dans :

```text
src/app/navigation/main-navigation.ts
```

Elle définit actuellement les trois sections principales :

```text
Overview
Fleet
Systems
```

Les routes déclarent leur section grâce au metadata Vue Router :

```ts
meta: {
  navigationSection: navigationSections.fleet,
}
```

Cela permet de distinguer :

```text
route exacte
≠
section active
```

Exemple :

```text
/fleet
/fleet/TEST-1
```

appartiennent toutes les deux à la section `Fleet`.

De la même manière :

```text
/systems
/systems/X1-TEST
/systems/X1-TEST/waypoints/X1-TEST-A1
/systems/X1-TEST/waypoints/X1-TEST-A1/market
```

restent toutes dans la section `Systems`.

`AppNavigation` peut ainsi exposer correctement :

```text
aria-current="page"
```

pour la route racine exacte d’une section, et :

```text
aria-current="location"
```

lorsque l’utilisateur se trouve plus profondément dans cette même section.

---

# Routage

Les routes authentifiées sont des enfants de `AppLayout`.

```text
/
├── overview
├── fleet
│   └── :symbol
└── systems
    └── :systemSymbol
        └── waypoints
            └── :waypointSymbol
                └── market
```

Les noms de route sont centralisés dans :

```text
src/app/router/route-names.ts
```

Les composants évitent ainsi de répéter des chaînes telles que :

```text
"ship-detail"
"system-detail"
"market"
```

dans toute l’application.

La route `/design-system` est réservée au développement et n’est ajoutée que lorsque :

```ts
import.meta.env.DEV
```

est actif.

---

# Modules fonctionnels

## Auth

Le module `auth` gère la session frontend.

Il possède :

```text
token
agentSymbol
hasToken
```

ainsi que les opérations permettant de :

```text
connecter
restaurer
déconnecter
```

Il ne stocke pas l’objet Agent complet.

---

## Agent

Le module `agent` représente la ressource :

```text
GET /my/agent
```

L’objet Agent est une donnée serveur.

Il est donc géré par TanStack Query avec la clé :

```ts
;['agent', 'current']
```

---

## Fleet

Le module `fleet` gère :

- la liste paginée des vaisseaux ;
- le détail d’un vaisseau ;
- la navigation ;
- le cargo ;
- l’équipage ;
- le fuel ;
- le cooldown ;
- les modules ;
- les mounts.

Les mutations sur les vaisseaux ne font pas partie du périmètre actuel.

---

## Systems

Le module `systems` gère :

- la liste des systèmes ;
- le détail d’un système ;
- les waypoints ;
- le détail d’un waypoint ;
- leurs relations orbitales ;
- leur statut Marketplace.

Il représente principalement la partie exploration et navigation spatiale.

---

## Markets

Le module `markets` gère les informations commerciales associées à un waypoint :

- exports ;
- imports ;
- exchange goods ;
- prix détaillés lorsqu’ils sont disponibles ;
- transactions lorsqu’elles sont disponibles.

Il reste séparé de `systems` même si son endpoint est imbriqué sous un waypoint.

---

# Code partagé

`src/shared/` contient uniquement les concepts ayant réellement plusieurs usages.

Exemples :

```text
shared/api/
→ HTTP, endpoints, erreurs

shared/components/feedback/
→ états génériques d’interface

shared/components/table/
→ base DataTable commune

shared/utils/formatters.ts
→ dates, nombres et labels

shared/schemas/trade-symbol.schema.ts
→ contrat de ressource commerciale partagé
```

Une fonction n’est pas déplacée dans `shared` uniquement parce qu’elle pourrait être utile plus tard.

L’extraction intervient lorsqu’un concept commun existe réellement.

---

# État local et état serveur

La séparation entre Pinia et TanStack Query est volontaire.

## Pinia

Pinia contient uniquement l’état de session local :

```ts
token
agentSymbol
hasToken
```

ainsi que :

```ts
setToken()
setAgentSymbol()
clearToken()
```

Il ne contient pas :

```text
Agent
Ships
Systems
Waypoints
Market
```

---

## `agentSymbol` n’est pas du server state dupliqué

`agentSymbol` est une exception volontairement limitée.

Il ne représente pas un second cache de l’objet Agent.

Il sert uniquement de snapshot d’identité pour le shell :

```text
AppHeader
→ TEST
```

Le détail Agent reste dans TanStack Query.

Cette séparation évite de devoir exécuter :

```text
GET /my/agent
```

depuis le layout sur chaque écran authentifié.

---

# Cycle de connexion

La connexion valide le token avant de créer la session.

```text
token candidat
    ↓
GET /my/agent
    ↓
validation réussie
    ↓
setToken()
    ↓
setAgentSymbol()
    ↓
nettoyage du QueryCache précédent
    ↓
mise en cache de ['agent', 'current']
    ↓
navigation vers l'application
```

Un token rejeté n’est pas persisté.

Le login est implémenté avec une mutation TanStack Query, car il s’agit d’une action déclenchée explicitement par l’utilisateur.

---

# Déconnexion

La déconnexion nettoie deux niveaux :

```text
session locale
+
cache serveur
```

Concrètement :

```text
localStorage
Pinia
TanStack Query cache
```

sont nettoyés.

Cette règle est importante car les query keys ne contiennent volontairement ni le token ni un identifiant de session.

Les données d’un agent précédent ne doivent jamais être présentées au suivant.

---

# Perte d’authentification

Le `QueryCache` surveille les erreurs d’authentification globales.

Lorsqu’une query authentifiée retourne une erreur normalisée comme :

```text
authentication
```

la session est invalidée et le cache est vidé.

Le layout observe ensuite la disparition de `hasToken` et ramène l’utilisateur vers la page de connexion.

Cette logique évite de devoir répéter le même traitement dans chaque page.

---

# TanStack Query

TanStack Query constitue la source de vérité pour les ressources SpaceTraders.

Il gère notamment :

- cache ;
- loading ;
- fetching ;
- erreurs ;
- retry ;
- garbage collection ;
- reconnexion ;
- placeholder data ;
- invalidation.

La configuration globale utilise notamment :

```text
staleTime              30 secondes
gcTime                 5 minutes
refetchOnWindowFocus   false
refetchOnReconnect     true
```

Les retries automatiques restent limités aux erreurs temporaires :

```text
network
timeout
server
```

et ne sont pas utilisés pour les erreurs métier ou d’authentification.

---

# Query keys

Les clés décrivent la ressource et tous les paramètres qui influencent les données demandées.

```ts
;['agent', 'current'][('ships', 'list', { page, limit })][('ships', 'detail', symbol)][
  ('systems', 'list', { page, limit })
][('systems', 'detail', systemSymbol)][('waypoints', 'list', systemSymbol, params)][
  ('waypoints', 'detail', systemSymbol, waypointSymbol)
][('markets', 'detail', systemSymbol, waypointSymbol)]
```

Chaque paramètre fonctionnel qui modifie le résultat doit participer à la clé.

Le token n’est pas inclus dans les query keys.

Le changement de session est protégé par le nettoyage du cache.

---

# Configuration SpaceTraders

Les informations globales de l’API sont centralisées sous :

```text
src/config/
```

`space-traders.ts` contient notamment :

```text
API base URL par défaut
URL du portail SpaceTraders
codes d'erreurs spécifiques utilisés par l'application
```

`env.ts` permet de surcharger le base URL avec :

```text
VITE_API_BASE_URL
```

sans disperser cette configuration dans les modules.

---

# Endpoints

Les chemins d’API sont centralisés dans :

```text
src/shared/api/endpoints.ts
```

Exemples :

```ts
apiEndpoints.agent.current

apiEndpoints.ships.list
apiEndpoints.ships.detail(symbol)

apiEndpoints.systems.list
apiEndpoints.systems.detail(systemSymbol)

apiEndpoints.systems.waypoints.list(systemSymbol)
apiEndpoints.systems.waypoints.detail(systemSymbol, waypointSymbol)
apiEndpoints.systems.waypoints.market(systemSymbol, waypointSymbol)
```

Les segments dynamiques sont encodés avant d’être injectés dans une URL.

Les modules ne reconstruisent donc pas chacun leur propre version des endpoints.

---

# Couche HTTP

Le client HTTP partagé est responsable de :

- la base URL ;
- le timeout ;
- l’en-tête `Authorization` ;
- l’annulation ;
- la normalisation des erreurs.

Les fonctions API restent indépendantes de Vue.

Exemple :

```ts
getShip(token, symbol, signal)
```

Une fonction API ne lit pas directement :

```text
Pinia
Vue Router
composant courant
```

Ses dépendances sont explicites.

---

# Gestion des erreurs

Les erreurs réseau sont transformées en `ApiError`.

L’application distingue notamment :

```text
network
timeout
authentication
rate-limit
server
request
invalid-response
```

Les statuts et codes SpaceTraders restent disponibles lorsque cela est nécessaire.

Une erreur ne doit pas être transformée artificiellement en état métier valide.

Exemple :

```text
réponse invalide
≠
liste vide
```

---

# Validation des réponses

SpaceTraders est une API externe.

Ses réponses sont donc validées avant d’entrer dans le reste de l’application.

La couche API utilise Zod.

Exemple conceptuel :

```ts
const result = shipResponseSchema.safeParse(response)

if (!result.success) {
  throw new ApiError('invalid-response', 'The ship response is incomplete or invalid.')
}
```

Les types TypeScript sont dérivés autant que possible des schémas :

```ts
export type Ship = z.infer<typeof shipSchema>
```

Cela évite de maintenir séparément :

```text
contrat runtime
+
interface TypeScript
```

---

# Validation de cohérence

Une réponse peut être structurellement valide tout en correspondant à une autre ressource que celle demandée.

La couche API vérifie donc aussi la cohérence des identifiants.

Exemples :

```text
GET /my/ships/TEST-1

Ship.symbol
doit être
TEST-1
```

```text
GET /systems/X1-TEST

System.symbol
doit être
X1-TEST
```

```text
GET /systems/X1-TEST/waypoints/X1-TEST-A1

Waypoint.systemSymbol
doit être
X1-TEST

Waypoint.symbol
doit être
X1-TEST-A1
```

```text
GET .../X1-TEST-A1/market

Market.symbol
doit être
X1-TEST-A1
```

Une incohérence produit une erreur `invalid-response`.

---

# AbortSignal

TanStack Query fournit un `AbortSignal` à chaque `queryFn`.

Il est propagé jusqu’au client HTTP.

```text
TanStack Query
    ↓
queryFn signal
    ↓
API function
    ↓
getJson()
    ↓
Axios
```

Il n’est donc pas nécessaire de créer manuellement un `AbortController` pour chaque écran.

---

# Responsabilité des pages

Une page orchestre principalement :

```text
route params
+
queries
+
états
+
navigation
+
composition
```

Par exemple `MarketPage.vue` :

- lit `systemSymbol` et `waypointSymbol` ;
- exécute `useMarketQuery()` ;
- traite loading, erreur, 404 et refresh ;
- compose les composants Market.

La page ne possède pas la logique générique de rendu d’une table.

---

# Composants métier

Les composants reçoivent directement les données typées nécessaires à leur responsabilité.

Exemples :

```text
ShipCrew
→ Ship['crew']

WaypointOverview
→ Waypoint

MarketResources
→ Market

ShipTable
→ Ship[]
```

Le projet évite de créer systématiquement des DTO de présentation lorsqu’une ressource validée est déjà adaptée au besoin.

---

# DataTable partagé

La V2 introduit une base de table commune sous :

```text
src/shared/components/table/
├── DataTable.vue
└── data-table.ts
```

Elle est utilisée par plusieurs domaines :

```text
Fleet
→ ShipTable

Systems
→ SystemTable

Waypoints
→ WaypointTable

Markets
→ MarketGoodsTable
→ MarketTransactionsTable
```

Cette abstraction est apparue après l’existence de plusieurs usages réels.

Elle n’a donc pas été créée prématurément.

---

## Responsabilité de DataTable

`DataTable` prend en charge uniquement le rendu générique commun :

- `<table>` sémantique ;
- `<thead>` et `<tbody>` ;
- rendu TanStack avec `FlexRender` ;
- alignement des colonnes ;
- classes spécifiques aux colonnes ;
- `aria-label` ;
- `aria-busy` ;
- état visuel `dimmed` ;
- largeur minimale ;
- débordement horizontal.

Il ne connaît aucune ressource métier.

---

## Métadonnées de colonnes

Les colonnes peuvent déclarer :

```ts
type DataTableColumnMeta = {
  align?: 'left' | 'center' | 'right'
  className?: string
  headerClassName?: string
  cellClassName?: string
}
```

Cela permet aux features de définir par exemple :

- colonnes numériques alignées à droite ;
- première colonne sticky ;
- tailles spécifiques ;
- présentation propre au header ou aux cellules.

Le composant générique n’a pas besoin de connaître ces choix métier.

---

## Ce que DataTable ne possède volontairement pas

`DataTable` ne gère pas :

```text
pagination serveur
URL
queries
filtres métier
refresh
navigation
empty states métier
colonnes métier
```

Ces responsabilités restent dans les features.

Exemple :

```text
FleetPage
├── pagination
├── URL
├── query
└── ShipTable
      ├── shipColumns
      └── DataTable
```

Cette limite évite de transformer `DataTable` en data grid générique surdimensionnée.

---

# Tables et responsive

Les tables peuvent contenir plus de colonnes que l’espace disponible sur mobile ou tablette.

Le conteneur `DataTable` possède donc :

```text
overflow-x-auto
```

et chaque wrapper métier définit une largeur minimale adaptée.

Exemples :

```text
Systems      58rem
Fleet        64rem
Waypoints    68rem
```

Le document entier ne doit pas s’élargir à cause d’une table.

Le scroll horizontal reste local à la table.

Les colonnes d’identité importantes peuvent rester sticky pendant ce déplacement.

---

# Tables versus Cards

La V2 ne cherche pas à remplacer toutes les cartes par des tables.

Le choix dépend du type d’information.

Les listes structurées et comparables utilisent principalement les tables :

```text
Ships
Systems
Waypoints
Trade goods
Transactions
```

Les informations hétérogènes utilisent encore des surfaces indépendantes :

```text
Ship modules
Ship mounts
Waypoint traits
Waypoint modifiers
```

Des composants historiques tels que :

```text
ShipCard
SystemCard
```

sont également conservés.

Ils peuvent servir ultérieurement à proposer une représentation alternative Cards/Table sans reconstruire ces vues depuis zéro.

---

# Navigation entre modules

Les modules se relient par leurs routes publiques et les symboles disponibles dans leurs ressources.

Exemples :

```text
Agent
→ Headquarters waypoint

Ship
→ System
→ Waypoint

Waypoint
→ System
→ Parent
→ Orbitals

Waypoint
→ Market

Market
→ Waypoint
→ System
```

Les composants d’un module n’importent pas un composant interne d’un autre module simplement pour permettre la navigation.

L’intégration passe principalement par :

```text
route names
+
route params
+
resource symbols
```

---

# Paramètres d’URL

Les états de navigation qui ont un intérêt pour l’utilisateur sont conservés dans l’URL.

Exemples :

```text
/fleet?page=2&limit=10

/systems?page=2&limit=20

/systems/X1-TEST?page=2&limit=10&marketplace=true
```

Cela améliore :

- retour navigateur ;
- partage d’une URL ;
- reload ;
- compréhension de l’état courant.

L’URL frontend n’a toutefois pas vocation à reproduire tous les paramètres techniques de l’API.

Exemple :

```text
marketplace=true
```

est converti par la couche API en :

```text
traits=MARKETPLACE
```

---

# Placeholder data et pagination

Lors d’un changement de page compatible, TanStack Query peut conserver temporairement la page précédente.

La table reçoit alors :

```text
isPlaceholderData
```

et peut être visuellement atténuée avec :

```text
dimmed
```

La structure de l’écran reste stable pendant le chargement.

---

# Changement d’identité d’une ressource

Les données précédentes ne doivent pas rester visibles lorsque l’identité de la ressource change.

Exemple :

```text
/fleet/SHIP-A
→
/fleet/SHIP-B
```

La fiche `SHIP-A` ne doit pas servir de placeholder au chargement de `SHIP-B`.

Le même principe s’applique aux systèmes, waypoints et marchés.

---

# Erreur pendant un refresh

Lorsqu’une ressource valide est déjà affichée et que son actualisation échoue, les données précédentes restent visibles.

L’utilisateur obtient :

```text
données précédentes
+
avertissement de refresh
```

plutôt qu’un remplacement complet par un écran d’erreur.

Cette règle est utilisée notamment dans :

- Fleet ;
- Ship detail ;
- System ;
- Waypoints ;
- Waypoint detail ;
- Market.

---

# Utilitaires

Une fonction pure reste proche du module lorsqu’elle décrit une règle propre à ce domaine.

Exemples :

```text
fleet/utils/ship-status.ts
systems/utils/waypoint-status.ts
```

Une fonction réellement générique passe dans `shared`.

Exemple :

```text
shared/utils/formatters.ts
```

La même règle s’applique aux schémas, composants et helpers.

---

# Icônes

Les icônes d’interface proviennent de :

```text
@lucide/vue
```

Le projet évite de maintenir manuellement des SVG génériques déjà fournis par la bibliothèque.

Lorsqu’une icône est uniquement décorative, elle ne porte pas le nom accessible de l’action.

Exemple :

```text
RouterLink
aria-label="Open ship TEST-1"

└── Eye
    aria-hidden="true"
```

Le contrôle interactif reste ainsi la source de vérité pour l’accessibilité.

---

# Accessibilité structurelle

Plusieurs choix sont intégrés à l’architecture de présentation :

- éléments `<table>` sémantiques ;
- `scope="col"` sur les headers ;
- `aria-label` pour les tables ;
- `aria-busy` pendant les refreshes ;
- navigation principale nommée ;
- `aria-current` selon la section active ;
- skip link vers le contenu ;
- focus visible ;
- liens et boutons avec noms accessibles explicites.

L’accessibilité n’est donc pas traitée uniquement comme une correction en fin de projet.

---

# Stratégie de tests

Le projet utilise plusieurs niveaux de tests complémentaires.

## Fonctions pures

Vitest vérifie notamment :

- formatters ;
- parsing de symboles ;
- règles de statut ;
- helpers purs.

---

## API et schémas

Les tests vérifient :

- validation Zod ;
- contrats incomplets ;
- cohérence de la ressource retournée ;
- endpoints ;
- gestion d’erreurs.

---

## Tests d’intégration Vue

Vue Test Utils et MSW couvrent :

```text
Vue
+
Router
+
Pinia
+
TanStack Query
+
API simulée
```

Ils vérifient notamment :

- chargements ;
- états vides ;
- erreurs ;
- refresh ;
- navigation ;
- pagination ;
- filtres ;
- changements de session.

---

## DataTable

La base partagée possède également ses propres tests pour protéger son contrat de rendu générique.

Les features testent ensuite leur comportement métier sans devoir retester toute l’implémentation interne de la table.

---

## End-to-end

Playwright couvre les deux parcours principaux :

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
→ navigation retour
```

Les E2E testent le parcours utilisateur complet sans recopier tous les cas déjà vérifiés avec Vitest et MSW.

---

# CI

La CI GitHub exécute :

```text
checkout
    ↓
pnpm install --frozen-lockfile
    ↓
pnpm check
    ↓
validation TypeScript / Prettier des E2E
    ↓
installation Chromium
    ↓
Playwright
    ↓
rapport Playwright
```

`pnpm check` regroupe :

```text
Oxlint
ESLint
Prettier check
Vitest
vue-tsc
Vite build
```

La CI vérifie donc à la fois :

```text
qualité statique
+
tests
+
types
+
build
+
parcours navigateur
```

---

# Principes de conception

## KISS

La solution la plus simple satisfaisant correctement le besoin actuel est privilégiée.

---

## YAGNI

Une fonctionnalité ou une abstraction n’est pas créée uniquement parce qu’elle pourrait devenir utile.

`DataTable` illustre cette règle :

```text
2 usages Market
→ pas encore d'abstraction générique

multiplication des usages réels
→ extraction d'une base partagée
```

---

## DRY avec prudence

Toute duplication n’est pas automatiquement un problème d’architecture.

L’extraction arrive lorsqu’un même concept apparaît réellement plusieurs fois.

---

## SOLID pragmatique

Les responsabilités sont séparées lorsque cela améliore :

- compréhension ;
- testabilité ;
- réutilisation ;
- couplage.

Le projet n’applique pas mécaniquement un pattern à chaque fichier.

---

# Choix volontairement non retenus

La version actuelle n’introduit pas :

```text
repository layer
domain entities frontend séparées
application service layer générique
event bus frontend
store global pour les données serveur
DTO de présentation systématiques
state machine globale
data grid générique possédant pagination et filtres métier
```

Ces outils peuvent devenir pertinents avec un périmètre plus large.

Ils ajouteraient actuellement plus d’indirections que de comportement utile.

---

# Évolutions possibles

Si le produit grandissait, plusieurs axes pourraient être évalués :

- vue Cards/Table pour Fleet et Systems ;
- préférences d’affichage persistées ;
- recherche et tri plus avancés ;
- filtres Waypoints supplémentaires ;
- mutations Fleet ;
- trading ;
- planification commerciale ;
- actualisation temps réel ;
- observabilité frontend ;
- tests d’accessibilité automatisés ;
- génération partielle des contrats depuis OpenAPI ;
- virtualisation des grandes listes si le volume le justifie.

Ces évolutions ne sont pas implémentées prématurément.

L’architecture actuelle cherche plutôt à laisser des points d’évolution clairs sans transformer le test technique en framework générique.
