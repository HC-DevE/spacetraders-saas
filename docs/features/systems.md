# Systems and waypoints

## Objectif

Le module `systems` permet d’explorer les systèmes connus, leurs waypoints et les relations entre ces différentes ressources.

Il couvre trois niveaux principaux :

```text
Systems list
→ liste paginée des systèmes connus

System detail
→ informations d’un système + liste de ses waypoints

Waypoint detail
→ informations détaillées d’un waypoint
```

Le marché d’un waypoint n’est pas rendu directement dans ce module.

Lorsqu’un waypoint possède réellement le trait :

```text
MARKETPLACE
```

il expose une navigation vers le module `markets`.

---

# Périmètre

## Liste des systèmes

La page :

```text
/systems
```

présente les systèmes connus dans une table structurée.

Chaque ligne expose notamment :

```text
System
Type
Sector
Coordinates
Waypoints
Factions
```

L’utilisateur peut :

- ouvrir un système ;
- parcourir les pages ;
- changer la taille de page ;
- actualiser les données.

La pagination est gérée côté serveur.

---

## Détail d’un système

La page :

```text
/systems/:systemSymbol
```

charge deux ressources séparément :

```text
System
+
Waypoints
```

Cette séparation est volontaire.

Un échec de chargement ou de refresh des waypoints ne doit pas masquer un système déjà chargé avec succès.

La page contient donc :

```text
System detail
├── SystemOverview
└── Waypoints
    ├── Marketplace filter
    ├── pagination
    └── WaypointTable
```

---

## Détail d’un waypoint

La page :

```text
/systems/:systemSymbol/waypoints/:waypointSymbol
```

présente les informations détaillées d’un waypoint.

Elle permet notamment de consulter :

```text
type
system
coordinates
faction
construction state
marketplace status
parent orbit
orbitals
traits
modifiers
chart
```

Les relations connues sont directement navigables.

---

# Organisation du module

```text
systems/
├── api/
│   ├── systems.api.ts
│   └── waypoints.api.ts
│
├── components/
│   ├── SystemCard.vue
│   ├── SystemOverview.vue
│   ├── SystemTable.vue
│   ├── system-table.columns.ts
│   ├── WaypointList.vue
│   ├── WaypointOverview.vue
│   ├── WaypointTable.vue
│   └── waypoint-table.columns.ts
│
├── composables/
│   ├── system.keys.ts
│   ├── waypoint.keys.ts
│   ├── use-system-query.ts
│   ├── use-systems-query.ts
│   ├── use-waypoint-query.ts
│   └── use-waypoints-query.ts
│
├── pages/
│   ├── SystemsPage.vue
│   ├── SystemDetailPage.vue
│   └── WaypointDetailPage.vue
│
├── schemas/
│   ├── system.schema.ts
│   ├── systems.schema.ts
│   ├── waypoint.schema.ts
│   └── waypoints.schema.ts
│
├── tests/
│
└── utils/
    └── waypoint-status.ts
```

---

# Responsabilités

| Fichier                                | Responsabilité                                |
| -------------------------------------- | --------------------------------------------- |
| `api/systems.api.ts`                   | Liste et détail des systèmes                  |
| `api/waypoints.api.ts`                 | Liste et détail des waypoints                 |
| `schemas/system.schema.ts`             | Contrat runtime d’un système                  |
| `schemas/systems.schema.ts`            | Pagination et réponse de liste Systems        |
| `schemas/waypoint.schema.ts`           | Contrat runtime complet d’un waypoint         |
| `schemas/waypoints.schema.ts`          | Pagination, recherche URL et filtres waypoint |
| `composables/system.keys.ts`           | Query keys Systems                            |
| `composables/waypoint.keys.ts`         | Query keys Waypoints                          |
| `use-systems-query.ts`                 | Liste paginée des systèmes                    |
| `use-system-query.ts`                  | Détail d’un système                           |
| `use-waypoints-query.ts`               | Liste paginée et filtrée des waypoints        |
| `use-waypoint-query.ts`                | Détail d’un waypoint                          |
| `pages/SystemsPage.vue`                | Pagination, refresh, états et composition     |
| `pages/SystemDetailPage.vue`           | Coordination système + waypoints              |
| `pages/WaypointDetailPage.vue`         | Route, états et actions waypoint              |
| `components/SystemTable.vue`           | Adaptateur Systems vers `DataTable`           |
| `components/system-table.columns.ts`   | Colonnes métier Systems                       |
| `components/SystemOverview.vue`        | Résumé structuré d’un système                 |
| `components/WaypointList.vue`          | Pagination et filtre Marketplace              |
| `components/WaypointTable.vue`         | Adaptateur Waypoints vers `DataTable`         |
| `components/waypoint-table.columns.ts` | Colonnes métier Waypoints                     |
| `components/WaypointOverview.vue`      | Présentation détaillée d’un waypoint          |
| `utils/waypoint-status.ts`             | Règles de statut Marketplace                  |
| `tests/`                               | Tests d’intégration et fonctions pures        |

---

# Appels réseau

Le module utilise :

```text
GET /systems?page={page}&limit={limit}

GET /systems/{systemSymbol}

GET /systems/{systemSymbol}/waypoints?page={page}&limit={limit}

GET /systems/{systemSymbol}/waypoints
    ?page={page}
    &limit={limit}
    &traits=MARKETPLACE

GET /systems/{systemSymbol}/waypoints/{waypointSymbol}
```

Le token est transmis explicitement aux fonctions API.

Les fonctions ne lisent pas directement le store Auth.

---

# Validation des réponses

Toutes les réponses SpaceTraders passent par les schémas Zod du module.

La validation porte à la fois sur :

```text
structure
+
cohérence métier minimale
```

---

## Cohérence de pagination

Pour une requête :

```text
page = 2
limit = 20
```

la réponse doit notamment retourner :

```text
meta.page = 2
meta.limit = 20
```

Une incohérence est considérée comme :

```text
invalid-response
```

---

## Cohérence du système

Pour :

```text
GET /systems/X1-TEST
```

le système retourné doit correspondre à :

```text
X1-TEST
```

L’application n’affiche pas silencieusement une autre ressource.

---

## Cohérence des waypoints

Pour une liste demandée sous :

```text
/systems/X1-TEST/waypoints
```

les waypoints retournés doivent appartenir à :

```text
X1-TEST
```

---

## Cohérence du détail waypoint

Pour :

```text
GET /systems/X1-TEST/waypoints/X1-TEST-A1
```

le contrat attendu vérifie notamment :

```text
waypoint.systemSymbol === "X1-TEST"

waypoint.symbol === "X1-TEST-A1"
```

Une incohérence produit une erreur explicite.

---

# Query keys

Les principales clés sont :

```ts
;['systems', 'list', { page, limit }][('systems', 'detail', systemSymbol)][
  ('waypoints', 'list', systemSymbol, params)
][('waypoints', 'detail', systemSymbol, waypointSymbol)]
```

Tous les paramètres influençant réellement les données demandées participent à la clé.

---

# Systems pagination

Les paramètres de liste sont conservés dans l’URL.

Exemple :

```text
/systems?page=2&limit=20
```

Les valeurs actuelles sont :

```text
page par défaut
→ 1

limit par défaut
→ 10

tailles proposées
→ 10, 20
```

Les valeurs invalides retombent sur les valeurs par défaut.

Changer de taille ramène automatiquement à :

```text
page = 1
```

---

# SystemsPage

`SystemsPage.vue` orchestre :

```text
route query
+
pagination
+
useSystemsQuery()
+
refresh
+
FeedbackState
+
SystemTable
```

La page possède les comportements métier de la liste.

Elle ne possède pas l’implémentation générique de la table.

---

# SystemTable

La V2 utilise :

```text
SystemsPage
    ↓
SystemTable
    ↓
DataTable
```

`SystemTable.vue` fournit notamment :

```text
systems
systemColumns
aria-label="Systems"
min-width="58rem"
busy
dimmed
```

Le rendu générique reste dans la base partagée.

---

# Colonnes Systems

Les colonnes sont définies dans :

```text
system-table.columns.ts
```

La table expose :

```text
System
Type
Sector
Coordinates
Waypoints
Factions
```

---

## System

La première colonne utilise :

```text
system.name
```

lorsqu’il est disponible.

Le symbole reste visible comme identifiant technique.

Le lien de détail porte un nom accessible de la forme :

```text
Open system X1-TEST
```

et utilise une icône :

```text
Eye
```

depuis :

```text
@lucide/vue
```

---

## Colonne sticky

La colonne System reste sticky pendant le scroll horizontal.

Elle constitue l’identité principale de la ligne.

L’utilisateur peut donc continuer à savoir quel système il consulte lorsqu’il parcourt les colonnes à droite.

---

## Type

Le type est formaté pour être lisible et utilise la couleur de support :

```text
Orbit
```

dans le langage visuel de l’application.

---

## Sector

La colonne présente :

```text
sectorSymbol
```

et, lorsqu’elle existe :

```text
constellation
```

Ces deux informations sont regroupées car elles décrivent la localisation galactique du système.

---

## Coordinates

Les coordonnées :

```text
x, y
```

sont rendues en typographie monospace et avec chiffres tabulaires.

---

## Waypoints

La table affiche le nombre de waypoints connus présents dans :

```text
system.waypoints
```

---

## Factions

Les factions connues sont regroupées dans la même cellule.

Lorsqu’aucune faction n’est retournée :

```text
None
```

est affiché.

L’absence de factions n’est pas traitée comme une erreur.

---

# Pourquoi une table pour Systems ?

Chaque système expose une structure comparable :

```text
identity
type
sector
coordinates
waypoint count
factions
```

La table améliore :

- le scan visuel ;
- la comparaison ;
- la densité d’information ;
- la cohérence avec Fleet et Waypoints.

---

# SystemCard

`SystemCard.vue` n’est plus le renderer principal de la liste.

Il est conservé volontairement comme représentation alternative.

Cela permet d’envisager plus tard :

```text
Cards
↔
Table
```

sans recréer la vue carte.

Aucun système de view mode n’est cependant ajouté prématurément dans la version actuelle.

---

# Placeholder data Systems

Lors d’un changement de page compatible, `useSystemsQuery()` peut conserver temporairement les résultats précédents.

La réutilisation n’a lieu que si :

```text
ancienne limit
===
nouvelle limit
```

La table reçoit alors :

```text
isPlaceholderData
```

et devient visuellement atténuée.

---

# SystemDetailPage

Le détail d’un système charge indépendamment :

```text
useSystemQuery()
```

et :

```text
useWaypointsQuery()
```

Le système et ses waypoints ne forment donc pas une query unique.

---

## Pourquoi deux queries ?

Les deux ressources possèdent des cycles de vie différents.

Par exemple :

```text
System
→ chargé avec succès

Waypoints
→ erreur réseau
```

Le système reste visible.

La page peut afficher :

```text
SystemOverview
+
erreur Waypoints
```

sans perdre les données déjà obtenues.

---

# SystemOverview

Le résumé d’un système présente actuellement :

```text
Sector
Constellation
Coordinates
Known waypoints
Factions
```

Les valeurs sont organisées dans une grille structurée avec :

```html
<dl></dl>
```

plutôt que dans une succession de cartes indépendantes.

---

# Liste des waypoints

La section Waypoints suit cette structure :

```text
SystemDetailPage
    ↓
WaypointList
    ↓
WaypointTable
    ↓
DataTable
```

Les responsabilités sont volontairement séparées.

---

# WaypointList

`WaypointList.vue` possède :

```text
count
Marketplace only
page size
pagination controls
empty states
```

Il ne définit pas directement les cellules de la table.

---

# Pagination Waypoints

Les paramètres sont conservés dans l’URL du système.

Exemple :

```text
/systems/X1-TEST?page=2&limit=10
```

Les tailles autorisées sont :

```text
10
20
```

Changer la taille ramène à :

```text
page = 1
```

---

# Filtre Marketplace

L’interface expose volontairement un seul filtre métier :

```text
Marketplace only
```

L’URL utilise :

```text
marketplace=true
```

Exemple :

```text
/systems/X1-TEST?page=1&limit=10&marketplace=true
```

La couche page traduit ensuite cet état en :

```ts
traits: ['MARKETPLACE']
```

et l’API construit :

```text
traits=MARKETPLACE
```

---

## Pourquoi ne pas exposer directement `traits` dans l’URL ?

L’interface répond à un besoin précis :

```text
montrer uniquement les waypoints avec un marché connu
```

Elle ne cherche pas à reproduire toute la surface technique de filtrage de l’API SpaceTraders.

L’URL reste donc centrée sur l’intention utilisateur.

---

# Reset lors du changement de filtre

Activer ou désactiver :

```text
Marketplace only
```

ramène automatiquement à :

```text
page = 1
```

Même principe lors d’un changement de taille.

Cela évite de conserver un numéro de page devenu invalide après modification du jeu de résultats.

---

# Placeholder data Waypoints

La page précédente peut être conservée temporairement uniquement lorsque :

```text
page size identique
+
traits identiques
```

Si le filtre Marketplace change :

```text
ancienne liste
≠
nouvelle population
```

les anciennes données ne sont donc pas utilisées comme placeholder.

---

# WaypointTable

La V2 utilise :

```text
WaypointList
    ↓
WaypointTable
    ↓
DataTable
```

`WaypointTable` fournit :

```text
waypoints
waypointColumns
aria-label="Waypoints"
min-width="68rem"
busy
dimmed
```

---

# Colonnes Waypoints

La table expose :

```text
Waypoint
Type
Coordinates
Orbitals
Faction
Traits
```

---

## Waypoint

La première colonne contient le symbole du waypoint.

Le lien de détail porte un nom accessible :

```text
View waypoint X1-TEST-A1
```

et utilise l’icône Lucide :

```text
Eye
```

Si le waypoint est en construction, la cellule affiche également :

```text
Under construction
```

---

## Colonne sticky

Comme pour Fleet et Systems, l’identité principale reste sticky pendant le scroll horizontal.

Cela permet de conserver le contexte de la ligne.

---

## Coordinates

Les coordonnées sont présentées en monospace :

```text
x, y
```

avec chiffres tabulaires.

---

## Orbitals

La colonne indique :

```text
waypoint.orbitals.length
```

Elle représente uniquement le nombre d’objets orbitaux connus.

---

## Faction

Si une faction est fournie :

```text
faction.symbol
```

est affiché.

Sinon :

```text
None reported
```

est utilisé.

---

# Traits

Les traits sont rendus sous forme de petits éléments visuels dans la cellule.

Ils restent une collection car un waypoint peut posséder plusieurs caractéristiques.

Lorsqu’aucun trait n’est retourné :

```text
No traits reported.
```

est affiché.

---

## Trait Marketplace

Le trait :

```text
MARKETPLACE
```

est visuellement distingué avec la couleur Signal.

Il s’agit d’une information réellement actionnable pour l’utilisateur car elle permet l’accès au Market.

---

# Waypoints non cartographiés

Le trait :

```text
UNCHARTED
```

possède une signification importante.

Un waypoint non cartographié peut ne pas exposer tous ses traits réels.

L’absence de :

```text
MARKETPLACE
```

ne permet donc pas nécessairement de conclure qu’aucun marché n’existe.

La fonction :

```text
getMarketplaceStatus()
```

centralise cette règle.

---

## Statuts Marketplace

Trois états sont distingués.

### Marketplace connu

Si le waypoint contient :

```text
MARKETPLACE
```

le statut est :

```text
Available
```

---

### Waypoint non cartographié

Si le waypoint ne contient pas Marketplace mais possède :

```text
UNCHARTED
```

le statut est :

```text
Unknown
```

---

### Waypoint cartographié sans Marketplace

Dans les autres cas :

```text
No marketplace trait
```

est affiché.

L’application n’invente donc jamais un marché absent du contrat reçu.

---

# WaypointDetailPage

La page de détail utilise :

```text
systemSymbol
+
waypointSymbol
```

depuis la route.

Elle exécute :

```text
useWaypointQuery()
```

et orchestre :

```text
loading
404
invalid route
refresh
market action
WaypointOverview
```

---

# Header Waypoint

Le header expose :

```text
Waypoint
symbol
type
system symbol
```

ainsi que les actions disponibles.

---

## Open market

Le bouton :

```text
Open market
```

n’est présent que lorsque :

```text
hasWaypointTrait(
  waypoint,
  'MARKETPLACE',
)
```

retourne `true`.

Un statut :

```text
Unknown
```

sur un waypoint `UNCHARTED` ne suffit pas à afficher l’action.

La navigation Market nécessite donc une connaissance réelle du trait.

---

# WaypointOverview

`WaypointOverview.vue` sépare les différentes catégories d’information selon leur nature.

La structure principale est :

```text
WaypointOverview
├── Overview
├── Traits
├── Modifiers
├── Orbitals
└── Chart
```

---

# Overview

La partie Overview utilise un :

```html
<dl></dl>
```

en grille.

Elle présente :

```text
Type
System
Coordinates
Faction
Construction
Marketplace
Parent orbit
Orbitals
Chart
```

Ces valeurs sont structurées et comparables.

---

# System link

Le système parent est directement navigable.

Le lien expose un nom accessible :

```text
Open system X1-TEST
```

---

# Construction

Deux états sont présentés :

```text
Operational
Under construction
```

Le second utilise le style Warning.

---

# Parent orbit

Lorsque :

```text
waypoint.orbits
```

est présent, le parent est un lien vers le détail du waypoint correspondant.

Le nom accessible suit :

```text
Open parent waypoint {symbol}
```

Lorsqu’aucun parent n’est déclaré :

```text
None
```

est affiché.

---

# Traits detail

Les traits détaillés sont rendus comme des surfaces indépendantes.

Chaque trait peut posséder :

```text
name
symbol
description
```

Le trait Marketplace bénéficie d’une bordure Signal et d’un label dédié.

---

## Pourquoi des cards ici ?

Contrairement à une liste de waypoints, les traits ne représentent pas plusieurs entités à comparer sur les mêmes colonnes.

Ils sont des informations descriptives hétérogènes.

Des surfaces indépendantes sont donc plus adaptées qu’une table.

---

# Modifiers

Les modifiers sont affichés uniquement lorsqu’ils existent.

Ils représentent des effets temporaires et utilisent la couleur Warning.

La section entière n’est pas rendue lorsque :

```text
modifiers
```

est absent ou vide.

---

# Orbitals

Les orbitals sont affichés sous forme de liens indépendants.

Chaque lien utilise :

```text
orbital.symbol
```

pour construire la route du waypoint correspondant.

Le nom accessible suit :

```text
Open orbital waypoint {symbol}
```

La section n’est rendue que lorsqu’au moins un orbital existe.

---

# Chart

La section Chart est affichée uniquement lorsque :

```text
waypoint.chart
```

existe.

Elle peut présenter :

```text
submittedBy
submittedOn
```

---

## Métadonnées de chart partielles

La présence d’un objet `chart` ne garantit pas que toutes les métadonnées soient fournies.

Si un chart existe mais qu’aucun :

```text
submittedBy
submittedOn
```

n’est disponible, l’interface affiche :

```text
Chart available, but submission metadata was not reported.
```

Elle ne fabrique pas de valeur de remplacement.

---

# Navigation croisée

Systems participe à plusieurs parcours.

## Depuis Agent

Le headquarters d’un agent peut mener vers son waypoint.

---

## Depuis Fleet

Un vaisseau peut ouvrir :

```text
System
Waypoint
```

depuis sa localisation.

---

## Depuis System

Un système ouvre ses waypoints.

---

## Depuis Waypoint

Un waypoint peut ouvrir :

```text
System
Parent waypoint
Orbital waypoint
Market
```

selon les données réellement disponibles.

---

## Depuis Market

La page Market peut revenir vers :

```text
Waypoint
System
```

Les modules restent donc reliés par :

```text
route names
+
symbols
```

et non par des imports de composants entre domaines.

---

# Responsive

`SystemTable` utilise une largeur minimale de :

```text
58rem
```

`WaypointTable` utilise :

```text
68rem
```

Lorsque le viewport devient plus étroit :

```text
DataTable
→ scroll horizontal local
```

La page entière ne doit pas créer de débordement horizontal.

Les premières colonnes sticky permettent de conserver l’identité des lignes.

---

# Refresh

Les trois niveaux peuvent être actualisés indépendamment :

```text
Systems
System
Waypoints
Waypoint
```

Lorsqu’une ressource est déjà chargée, le refresh ne supprime pas immédiatement les données existantes.

---

## Échec pendant refresh

Le comportement est :

```text
données précédentes
+
warning
```

et non :

```text
écran entièrement remplacé par une erreur
```

Cela s’applique notamment à :

```text
SystemsPage
SystemDetailPage
WaypointDetailPage
```

---

# Offline

Lorsqu’une query ne peut pas partir faute de connexion :

```text
Waiting for connection
```

est présenté.

Lorsqu’un refresh est suspendu alors que des données existent déjà, ces données restent visibles.

---

# Liste vide et page hors limites

Les listes distinguent plusieurs situations.

## Aucun système

```text
No systems available
```

---

## Page Systems vide alors que des données existent ailleurs

```text
No systems on this page
```

avec possibilité de revenir à la première page.

---

## Aucun waypoint

```text
No waypoints available
```

---

## Aucun waypoint Marketplace

Avec le filtre actif :

```text
No marketplace waypoints
```

et l’utilisateur peut revenir à :

```text
Show all waypoints
```

---

# 404

Le détail distingue les absences réelles :

```text
System not found
Waypoint not found
```

des erreurs réseau ou de validation.

Un `404` ne déclenche pas de retry automatique sans fin.

---

# Authentification

Le module ne possède pas sa propre logique de logout sur erreur d’authentification.

Une erreur :

```text
kind = authentication
```

est gérée au niveau du QueryCache global.

Le parcours devient :

```text
session invalidée
→ cache nettoyé
→ AppLayout
→ Login
```

---

# Utilitaires

La règle métier Marketplace reste dans :

```text
systems/utils/waypoint-status.ts
```

Elle expose notamment :

```ts
hasWaypointTrait()

getMarketplaceStatus()
```

Ces fonctions restent proches du module car elles décrivent une règle spécifique aux Waypoints.

Les formatters génériques restent dans :

```text
shared/utils/formatters.ts
```

---

# Tests

Le module possède plusieurs suites complémentaires.

## `systems.spec.ts`

La liste Systems vérifie notamment :

- transmission du token ;
- fallback des paramètres d’URL invalides ;
- pagination ;
- changement de taille ;
- liste vide ;
- page hors limites ;
- réponse invalide ;
- pagination incohérente ;
- conservation des données après un refresh échoué ;
- isolation entre deux sessions ;
- navigation vers le détail d’un système.

---

## `system-detail.spec.ts`

Le détail System vérifie notamment :

- chargement indépendant du système et des waypoints ;
- conservation du système lorsque Waypoints échoue ;
- pagination des waypoints ;
- filtre Marketplace ;
- persistance du filtre dans l’URL ;
- reset de page lors du changement de filtre ;
- réponse Waypoints invalide ;
- refresh Waypoints échoué ;
- système introuvable ;
- système incohérent ;
- navigation vers le détail d’un waypoint.

La liste de waypoints est testée via la table sémantique :

```text
aria-label="Waypoints"
```

---

## `waypoint-detail.spec.ts`

La fiche Waypoint vérifie notamment :

- utilisation de la session active ;
- lien vers le système ;
- lien vers le parent ;
- liens orbitals ;
- traits ;
- modifiers ;
- chart ;
- état Marketplace `Unknown` pour `UNCHARTED` ;
- 404 ;
- réponse incomplète ;
- réponse incohérente ;
- retry après erreur initiale ;
- conservation des données lors d’un refresh échoué ;
- présence du bouton Market uniquement avec `MARKETPLACE`.

---

## `waypoint-status.spec.ts`

Cette suite teste directement :

```text
hasWaypointTrait()
getMarketplaceStatus()
```

et protège notamment les trois états :

```text
Available
Unknown
No marketplace trait
```

---

# E2E

Le second parcours Playwright couvre :

```text
Login
    ↓
Systems
    ↓
System detail
    ↓
Waypoint detail
    ↓
Market
    ↓
navigation retour
```

Les sélecteurs s’appuient sur les noms accessibles.

Exemples :

```text
Systems
Waypoints

Open system X1-TEST

View waypoint X1-TEST-A1

Open waypoint market
```

Le test reste ainsi découplé de la structure CSS.

---

# Choix de conception

## Systems et Waypoints dans le même module

Les deux ressources appartiennent au même parcours d’exploration.

Un waypoint est toujours contextualisé par :

```text
systemSymbol
```

Les séparer en deux modules apporterait ici davantage d’indirection que de bénéfice.

---

## Markets séparé

Le marché constitue en revanche un domaine suffisamment spécifique pour posséder :

```text
schemas
query
API
components
page
tests
```

dans son propre module.

---

## Table pour les listes

Systems et Waypoints contiennent des entités homogènes avec des attributs comparables.

La table est donc la représentation par défaut.

---

## Cards pour les détails hétérogènes

Traits, modifiers et orbitals possèdent une structure plus descriptive et ne bénéficient pas d’une comparaison colonne par colonne.

Ils restent donc présentés sous forme de surfaces indépendantes.

---

## Filtre Marketplace volontairement limité

Le frontend ne reproduit pas tous les filtres SpaceTraders.

Il expose uniquement le besoin actuellement utile dans le produit :

```text
Marketplace only
```

---

# Limites actuelles

La version actuelle n’implémente pas :

- carte graphique de la galaxie ;
- recherche globale par symbole ;
- recherche textuelle des systèmes ;
- tri interactif ;
- filtres génériques par type ;
- filtres arbitraires par trait ;
- préchargement automatique de tous les détails Waypoint ;
- visualisation orbitale graphique ;
- persistance d’un futur mode Cards/Table ;
- restauration manuelle des filtres lors d’un lien `Back to system`.

Pour ce dernier point, le bouton Back du navigateur conserve naturellement l’historique complet de navigation.

Ces fonctionnalités pourront être ajoutées lorsqu’un besoin produit concret le justifiera.
