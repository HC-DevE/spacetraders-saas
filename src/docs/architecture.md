# Architecture

## Objectif

Space Control est une application frontend Vue 3 utilisant l’API SpaceTraders.

L’architecture cherche à répondre à plusieurs objectifs :

- garder les fonctionnalités facilement identifiables ;
- séparer l’état local des données serveur ;
- valider les réponses externes avant leur utilisation ;
- garder les fonctions API indépendantes de Vue et Pinia ;
- rendre les parcours faciles à tester ;
- éviter les abstractions ou couches qui n’apportent pas encore de valeur.

Le projet privilégie une architecture modulaire pragmatique plutôt qu’une architecture en couches génériques.

---

## Organisation générale

```text
src/
├── app/
│   ├── layouts/
│   ├── pages/
│   ├── providers/
│   └── router/
│
├── config/
│
├── modules/
│   ├── auth/
│   ├── agent/
│   ├── fleet/
│   ├── systems/
│   └── markets/
│
├── shared/
│   ├── api/
│   ├── components/
│   ├── schemas/
│   ├── styles/
│   └── utils/
│
└── __tests__/
```

Les modules correspondent à des responsabilités fonctionnelles de l’application.

```text
auth
→ session et connexion

agent
→ informations de l’agent courant

fleet
→ vaisseaux de l’agent

systems
→ exploration des systèmes et waypoints

markets
→ informations commerciales
```

Cette organisation ne cherche pas à reproduire exactement la structure des endpoints SpaceTraders.

Par exemple, l’endpoint Market est techniquement imbriqué sous `/systems`, mais `markets` reste un module distinct car sa responsabilité fonctionnelle est commerciale.

---

## Responsabilité des niveaux

Dans un module :

| Dossier        | Responsabilité                                      |
| -------------- | --------------------------------------------------- |
| `api/`         | Appels HTTP, parsing et validation des réponses     |
| `schemas/`     | Contrats Zod et types TypeScript déduits            |
| `composables/` | Queries, mutations et logique réactive réutilisable |
| `pages/`       | Paramètres de route, états d’écran et composition   |
| `components/`  | Présentation d’une partie de fonctionnalité         |
| `utils/`       | Fonctions pures propres au module                   |
| `tests/`       | Fixtures et vérification des comportements          |

Les composants Vue ne doivent pas devenir le lieu où sont regroupés :

```text
requêtes HTTP
+
validation
+
règles métier
+
formatage générique
+
présentation
```

Chaque responsabilité est déplacée au niveau le plus simple qui permet sa réutilisation ou son test.

---

## `app`

`src/app/` assemble les briques principales de l’application.

Il contient notamment :

- le routeur ;
- les guards d’accès ;
- le layout principal ;
- la configuration globale de TanStack Query ;
- les pages globales telles que les routes inexistantes.

`app` ne contient pas de logique métier propre à Fleet, Systems ou Markets.

---

## Modules fonctionnels

### Auth

`auth` gère uniquement la session locale :

```text
token
hasToken
login
logout
```

Il ne contient pas les données Agent.

---

### Agent

`agent` représente la ressource `/my/agent`.

Les informations de l’agent sont du server state et sont donc stockées dans TanStack Query.

---

### Fleet

`fleet` gère :

- la liste paginée des vaisseaux ;
- le détail d’un vaisseau ;
- les informations de navigation ;
- les ressources ;
- les équipements ;
- les états associés.

Les actions de modification des vaisseaux ne font pas partie du périmètre actuel.

---

### Systems

`systems` gère :

- la liste des systèmes ;
- le détail d’un système ;
- la liste des waypoints ;
- le détail d’un waypoint ;
- les relations entre waypoints.

Il représente principalement la partie exploration et géographie de l’application.

---

### Markets

`markets` gère :

- les exports ;
- les imports ;
- les ressources exchange ;
- les prix lorsqu’ils sont disponibles ;
- les transactions récentes lorsqu’elles sont disponibles.

Cette responsabilité reste séparée de `systems` même si SpaceTraders expose le Market via une URL imbriquée dans un système et un waypoint.

---

## Code partagé

`src/shared/` contient uniquement des éléments réellement utilisés par plusieurs fonctionnalités.

Exemples :

```text
shared/api/
→ client HTTP et erreurs

shared/components/
→ AppButton, FeedbackState

shared/utils/formatters.ts
→ nombres, dates et labels

shared/schemas/trade-symbol.schema.ts
→ contrat TradeSymbol partagé par Fleet et Markets
```

Une fonction ou un type n’est pas déplacé dans `shared` uniquement parce qu’il pourrait éventuellement être réutilisé plus tard.

Il devient partagé lorsqu’un deuxième usage réel apparaît.

---

## État local et état serveur

La séparation entre Pinia et TanStack Query est volontaire.

### Pinia

Pinia gère uniquement l’état de session réellement local :

```ts
token
hasToken
setToken()
clearToken()
```

Il ne contient pas :

```text
agent
ships
systems
waypoints
market
```

---

### TanStack Query

TanStack Query est la source de vérité pour les données provenant de SpaceTraders.

Il gère notamment :

- cache ;
- loading ;
- fetching ;
- erreurs ;
- retry ;
- invalidation ;
- conservation temporaire de certaines pages ;
- comportements liés à la reconnexion.

Les données serveur ne sont donc pas copiées dans un second store.

Cela évite d’avoir à synchroniser manuellement :

```text
Pinia
↔
API
↔
TanStack Query
```

---

## Query keys

Les clés sont orientées ressources et paramètres fonctionnels.

Exemples :

```ts
['agent', 'current']

['ships', 'list', { page, limit }]
['ships', 'detail', symbol]

['systems', 'list', { page, limit }]
['systems', 'detail', systemSymbol]

['waypoints', 'list', systemSymbol, params]
['waypoints', 'detail', systemSymbol, waypointSymbol]

[
  'markets',
  'detail',
  systemSymbol,
  waypointSymbol,
]
```

Chaque paramètre susceptible de modifier les données demandées doit participer à la clé.

Le token n’est pas utilisé dans les query keys.

Le changement de session est géré par le nettoyage du QueryCache.

---

## Validation des réponses

SpaceTraders est une API externe.

Les réponses sont donc considérées comme non fiables tant qu’elles n’ont pas été validées.

La couche `api/` applique les schémas Zod avant de retourner une ressource.

Exemple :

```ts
const result = shipResponseSchema.safeParse(response)

if (!result.success) {
  throw new ApiError('invalid-response', 'The ship response is incomplete or invalid.')
}
```

Les types TypeScript sont autant que possible déduits des schémas :

```ts
export type Ship = z.infer<typeof shipSchema>
```

Cela évite de maintenir indépendamment :

```text
schema runtime
+
interface TypeScript
```

---

## Validation de cohérence

Une réponse valide syntaxiquement peut malgré tout être incohérente avec la requête effectuée.

Certaines fonctions API effectuent donc une seconde validation.

Exemples :

```text
GET /my/ships/TEST-1
→ Ship.symbol doit être TEST-1

GET /systems/X1-TEST
→ System.symbol doit être X1-TEST

GET /systems/X1-TEST/waypoints/X1-TEST-A1
→ Waypoint.systemSymbol doit être X1-TEST
→ Waypoint.symbol doit être X1-TEST-A1

GET .../X1-TEST-A1/market
→ Market.symbol doit être X1-TEST-A1
```

Une incohérence produit une erreur `invalid-response`.

L’application ne doit pas présenter une ressource appartenant à un autre identifiant uniquement parce que sa structure est valide.

---

## Fonctions API indépendantes de Vue

Les fonctions API reçoivent leurs dépendances explicitement.

Exemple :

```ts
getShip(token, symbol, signal)
```

Elles ne lisent pas :

```text
Pinia
Vue Router
composant courant
```

Cela permet de les tester et de les réutiliser sans dépendre de l’environnement Vue.

---

## AbortSignal

TanStack Query fournit un `AbortSignal` à ses `queryFn`.

Ce signal est transmis jusqu’au client HTTP.

```text
TanStack Query
→ queryFn signal
→ API function
→ HTTP request
```

Il n’est donc pas nécessaire de créer manuellement un `AbortController` pour chaque query.

---

## Pages

Une page doit principalement orchestrer :

```text
route params
+
queries
+
états
+
composition
```

Par exemple `MarketPage.vue` :

- lit `systemSymbol` et `waypointSymbol` ;
- lance `useMarketQuery()` ;
- traite loading/error/404/refresh ;
- compose `MarketResources`, `MarketGoodsTable` et `MarketTransactionsTable`.

Elle ne définit pas les colonnes de table ni les formatters génériques.

---

## Composants

Les composants reçoivent directement les données typées nécessaires à leur responsabilité.

Exemple :

```text
ShipCrew
→ informations Crew

MarketGoodsTable
→ MarketTradeGood[]

WaypointOverview
→ Waypoint
```

Le projet évite de créer des DTO de présentation uniquement pour transformer une ressource API déjà adaptée à l’affichage.

---

## Utilitaires

Une fonction pure reste proche du module lorsqu’elle exprime une règle spécifique.

Exemples :

```text
fleet/utils/ship-status.ts
systems/utils/waypoint-status.ts
```

Une fonction générique utilisée par plusieurs modules passe dans `shared`.

Exemple :

```text
shared/utils/formatters.ts
```

---

## Navigation entre modules

Les modules peuvent se relier par leurs routes publiques et les identifiants présents dans les ressources.

Exemples :

```text
Agent
→ headquarters waypoint

Ship
→ system
→ waypoint

Waypoint
→ system
→ parent
→ orbitals

Waypoint
→ Market

Market
→ Waypoint
→ System
```

Les modules ne doivent pas importer les composants internes d’un autre module simplement pour créer une navigation.

Ils communiquent principalement par :

```text
routes
+
symbols
```

---

## Paramètres d’URL

Les paramètres de navigation utilisateur peuvent être conservés dans l’URL.

Exemples :

```text
/fleet?page=2&limit=10

/systems?page=2&limit=20

/systems/X1-TEST?page=2&limit=10&marketplace=true
```

Cela améliore :

- navigation précédente/suivante ;
- partage d’URL ;
- rechargement de la page ;
- lisibilité de l’état courant.

L’URL frontend n’a cependant pas vocation à reproduire automatiquement tous les paramètres techniques de SpaceTraders.

Le filtre Waypoint `marketplace=true` est par exemple converti dans la couche API vers :

```text
traits=MARKETPLACE
```

---

## Gestion des erreurs

Les erreurs HTTP sont normalisées par le client partagé.

L’interface distingue notamment :

- erreur réseau ;
- timeout ;
- authentification ;
- limitation de requêtes ;
- erreur serveur ;
- réponse invalide ;
- ressource introuvable.

Les erreurs ne doivent pas être transformées en états métier valides.

Par exemple :

```text
réponse invalide
≠
liste vide
```

---

## Données précédentes pendant un refresh

Lorsque des données valides sont déjà disponibles et qu’une actualisation échoue, elles restent affichées.

L’utilisateur voit alors :

```text
données précédentes
+
avertissement de refresh
```

plutôt qu’un écran entièrement remplacé par une erreur.

Cette règle s’applique notamment à :

- Fleet ;
- System ;
- Waypoints ;
- Market.

---

## Placeholders et changements de ressource

Les données précédentes ne sont pas utilisées comme placeholder lorsque l’identité de la ressource change.

Exemple :

```text
/fleet/SHIP-A
→
/fleet/SHIP-B
```

La fiche de `SHIP-A` ne doit pas rester affichée pendant le chargement de `SHIP-B`.

En revanche, une pagination de liste peut temporairement conserver la page précédente lorsque le contexte de requête reste compatible.

---

## Tables

Les tables complexes de Market utilisent TanStack Table.

L’intégration actuelle reste limitée au besoin :

```text
typed columns
row model
FlexRender
```

Aucun composant générique `AppTable` n’est introduit pour seulement deux usages.

Si plusieurs modules finissent par partager réellement :

- tri ;
- pagination ;
- colonnes ;
- loading ;
- empty states ;

une abstraction commune pourra être évaluée à ce moment-là.

---

## Stratégie de tests

Le projet utilise plusieurs niveaux.

### Fonctions pures

Vitest vérifie notamment :

- calculs ;
- formatters ;
- règles de statut ;
- parsing de symboles.

### Tests d’intégration Vue

Vue Test Utils + MSW vérifient :

- pages ;
- router ;
- Pinia ;
- TanStack Query ;
- appels réseau simulés ;
- états ;
- erreurs ;
- navigation.

### E2E

Playwright couvre uniquement les parcours critiques.

```text
Agent → Fleet → Ship

Systems
→ System
→ Waypoint
→ Market
```

Les tests E2E ne recopient pas tous les cas déjà couverts au niveau intégration.

---

## Principes de simplicité

Le projet applique plusieurs règles pragmatiques.

### KISS

Choisir la solution la plus simple permettant de satisfaire correctement le besoin actuel.

### YAGNI

Ne pas créer une fonctionnalité ou une abstraction uniquement parce qu’elle pourrait devenir utile.

### DRY avec prudence

Une duplication ponctuelle n’est pas automatiquement une abstraction.

Le code est extrait lorsque plusieurs usages expriment réellement le même concept.

### SOLID pragmatique

Les responsabilités sont séparées lorsqu’elles permettent :

- une meilleure lecture ;
- un meilleur test ;
- moins de couplage.

L’objectif n’est pas d’appliquer mécaniquement un pattern pour chaque fichier.

---

## Choix volontairement non retenus

Cette version n’utilise pas :

```text
repository layer
domain entities séparées
application services génériques
event bus frontend
store global pour toutes les données
DTO de présentation systématiques
generic AppTable
```

Ces outils pourraient devenir pertinents dans une application plus grande, mais ils ajouteraient actuellement des indirections sans comportement supplémentaire.

---

## Évolutions possibles

Si le périmètre grandissait, certains choix pourraient être réévalués :

- génération partielle depuis l’OpenAPI ;
- modèle de filtres Waypoints plus complet ;
- contexte de navigation plus riche ;
- mutations Fleet ;
- trading ;
- stratégie d’actualisation temps réel ;
- observabilité frontend ;
- tests d’accessibilité automatisés ;
- abstraction commune de tables si les usages se multiplient.

L’architecture actuelle vise à permettre ces évolutions sans les implémenter prématurément.
