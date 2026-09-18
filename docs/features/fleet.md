# Fleet

## Objectif

Le module `fleet` permet de consulter les vaisseaux appartenant à l’agent connecté.

Il couvre deux parcours principaux :

```text
Fleet list
→ vue synthétique et paginée de la flotte

Ship detail
→ informations détaillées d'un vaisseau
```

Le nom du module représente le périmètre fonctionnel de la flotte.

Les fonctions API et les query keys utilisent `ships`, qui correspond à la ressource manipulée par SpaceTraders.

---

# Périmètre

## Liste des vaisseaux

La page :

```text
/fleet
```

présente les vaisseaux dans une table structurée.

Chaque ligne expose notamment :

```text
Ship
Role
Status
Location
Fuel
Cargo
```

L’utilisateur peut directement :

- ouvrir le détail d’un vaisseau ;
- ouvrir son système ;
- ouvrir son waypoint ;
- consulter sa destination lorsqu’il est en transit ;
- consulter son heure d’arrivée prévue ;
- changer de page ;
- changer la taille de page ;
- actualiser les données.

La liste utilise une pagination serveur.

---

## Détail d’un vaisseau

La page :

```text
/fleet/:symbol
```

rassemble les principales informations techniques du vaisseau.

| Section    | Informations                                           |
| ---------- | ------------------------------------------------------ |
| Resources  | Fuel, cargo, crew et avertissements                    |
| Navigation | Position actuelle, origine, destination et dates       |
| Crew       | Current, required, capacity, rotation, morale et wages |
| Cooldown   | Durée totale, temps restant et expiration              |
| Cargo      | Ressources transportées et quantités                   |
| Equipment  | Frame, reactor et engine                               |
| Modules    | Modules installés                                      |
| Mounts     | Mounts installés et propriétés disponibles             |

Les actions modifiant la ressource ne font pas partie du périmètre actuel.

Par exemple :

```text
navigate
dock
orbit
refuel
purchase
sell
install module
remove mount
```

ne sont pas implémentées.

---

# Organisation du module

```text
fleet/
├── api/
│   └── ships.api.ts
│
├── components/
│   ├── ShipCard.vue
│   ├── ShipTable.vue
│   ├── ship-table.columns.ts
│   └── ship-detail/
│       ├── ShipCargo.vue
│       ├── ShipCooldown.vue
│       ├── ShipCrew.vue
│       ├── ShipEquipment.vue
│       ├── ShipModules.vue
│       ├── ShipMounts.vue
│       ├── ShipNavigation.vue
│       └── ShipResources.vue
│
├── composables/
│   ├── ship.keys.ts
│   ├── use-ship-query.ts
│   └── use-ships-query.ts
│
├── pages/
│   ├── FleetPage.vue
│   └── ShipDetailPage.vue
│
├── schemas/
│   ├── ship.schema.ts
│   └── ships.schema.ts
│
├── tests/
│
└── utils/
    ├── ship-formatters.ts
    └── ship-status.ts
```

---

# Responsabilités

| Fichier                            | Responsabilité                                   |
| ---------------------------------- | ------------------------------------------------ |
| `api/ships.api.ts`                 | Requêtes HTTP et validation des réponses         |
| `schemas/ship.schema.ts`           | Contrat runtime d’un vaisseau                    |
| `schemas/ships.schema.ts`          | Pagination, paramètres d’URL et réponse de liste |
| `composables/ship.keys.ts`         | Query keys Fleet                                 |
| `composables/use-ships-query.ts`   | Query de liste paginée                           |
| `composables/use-ship-query.ts`    | Query d’un vaisseau                              |
| `pages/FleetPage.vue`              | Pagination, états d’écran et composition         |
| `pages/ShipDetailPage.vue`         | Route, états du détail et composition            |
| `components/ShipTable.vue`         | Adaptateur entre Fleet et `DataTable`            |
| `components/ship-table.columns.ts` | Définition des colonnes métier                   |
| `components/ShipCard.vue`          | Représentation alternative d’un vaisseau         |
| `components/ship-detail/`          | Sections indépendantes de la fiche               |
| `utils/ship-status.ts`             | Présentation du statut de navigation             |
| `utils/ship-formatters.ts`         | Formatage spécifique Fleet                       |
| `tests/`                           | Tests fonctionnels et d’intégration              |

---

# Appels réseau

Le module utilise :

```text
GET /my/ships?page={page}&limit={limit}

GET /my/ships/{symbol}
```

Le token est transmis explicitement :

```ts
getShips(token, params, signal)

getShip(token, symbol, signal)
```

Les fonctions API ne lisent pas directement le store Auth.

---

# Validation des réponses

Les réponses SpaceTraders sont validées avec Zod.

La liste vérifie notamment :

```text
data
meta.page
meta.limit
meta.total
```

Le détail vérifie le contrat complet d’un vaisseau.

---

## Cohérence de pagination

La réponse de liste doit correspondre à la requête envoyée.

Par exemple :

```text
request
page = 2
limit = 10
```

doit produire :

```text
response.meta.page = 2
response.meta.limit = 10
```

Une incohérence est considérée comme une réponse invalide.

---

## Cohérence du détail

Pour :

```text
GET /my/ships/TEST-1
```

le contrat attendu est :

```text
Ship.symbol === "TEST-1"
```

Une réponse contenant un autre vaisseau ne doit pas être affichée comme valide.

Elle produit une erreur :

```text
invalid-response
```

---

# Query keys

Les clés Fleet sont :

```ts
;['ships', 'list', { page, limit }][('ships', 'detail', symbol)]
```

Les paramètres influençant réellement la ressource demandée participent à la clé.

Le token n’est pas inclus.

Le changement de session est sécurisé par le nettoyage du QueryCache lors des transitions d’authentification.

---

# Pagination

Les paramètres de pagination sont conservés dans l’URL.

Exemple :

```text
/fleet?page=2&limit=10
```

Les valeurs actuelles sont :

```text
page par défaut
→ 1

limit par défaut
→ 10

tailles proposées
→ 1, 5, 10, 20
```

Les paramètres invalides retombent sur les valeurs par défaut.

---

## Modification de page

Changer de page utilise :

```ts
router.replace()
```

et conserve la taille sélectionnée.

Exemple :

```text
/fleet?page=1&limit=10
→
/fleet?page=2&limit=10
```

---

## Modification de taille

Changer `limit` ramène automatiquement à :

```text
page = 1
```

Cela évite qu’une page valide avec une ancienne taille devienne incohérente avec la nouvelle pagination.

---

# Placeholder data

Lorsqu’une autre page est demandée avec une pagination compatible, TanStack Query conserve temporairement les résultats précédents.

Le parcours devient :

```text
page 1 visible
    ↓
Next
    ↓
requête page 2
    ↓
page 1 temporairement conservée
    ↓
page 2 disponible
```

La table est alors atténuée visuellement.

Un message indique également que l’ancienne page est encore présentée.

---

## Pourquoi garder les résultats précédents ?

Sans cette stratégie :

```text
table
→ disparaît
→ loader
→ nouvelle table
```

à chaque changement de page.

La conservation temporaire stabilise l’interface.

Elle ne doit cependant pas masquer le fait qu’une nouvelle requête est en cours.

---

# FleetPage

`FleetPage.vue` orchestre :

```text
route query
+
pagination
+
useShipsQuery()
+
refresh
+
FeedbackState
+
ShipTable
```

La page ne connaît pas les détails internes de rendu d’une table TanStack.

Elle possède les comportements métier de la liste :

- nombre total de vaisseaux ;
- pagination ;
- changement de taille ;
- refresh ;
- page vide ;
- page hors limites ;
- erreur initiale ;
- erreur pendant refresh.

---

# ShipTable

La V2 utilise :

```text
FleetPage
    ↓
ShipTable
    ↓
DataTable
```

`ShipTable.vue` reste volontairement très léger.

Il fournit au composant partagé :

```text
ships
shipColumns
aria-label="Fleet"
min-width="64rem"
busy
dimmed
```

Il constitue la frontière entre :

```text
domaine Fleet
```

et :

```text
infrastructure de rendu DataTable
```

---

# Définition des colonnes

Les colonnes métier sont définies dans :

```text
ship-table.columns.ts
```

Elles connaissent :

- les propriétés d’un `Ship` ;
- les routes associées ;
- les labels métier ;
- les statuts ;
- les règles de présentation Fleet.

`DataTable` ne connaît rien de ces détails.

---

## Colonne Ship

La première colonne contient principalement :

```text
registration.name
ship.symbol
frame.name
```

Le nom du vaisseau est directement un lien vers sa fiche.

Le lien expose :

```text
aria-label="Open ship {symbol}"
```

et une icône :

```text
Eye
```

provenant de :

```text
@lucide/vue
```

L’icône est décorative :

```text
aria-hidden="true"
```

---

## Colonne sticky

La colonne Ship reste visible pendant le scroll horizontal.

Elle utilise une position :

```text
sticky
left: 0
```

Cette décision permet de conserver l’identité de la ligne lorsque les colonnes situées à droite sortent du viewport.

---

# Role

La colonne Role affiche :

```text
registration.role
registration.factionSymbol
```

Le rôle est formaté pour être lisible.

Le faction symbol reste présenté comme une valeur technique.

---

# Status

La colonne Status sépare :

```text
navigation status
```

et :

```text
flight mode
```

Exemples de statuts :

```text
DOCKED
→ Docked

IN_ORBIT
→ In orbit

IN_TRANSIT
→ In transit
```

Le statut possède une indication visuelle compacte.

Le mode de vol reste présenté séparément afin de ne pas mélanger deux concepts différents.

---

# Location

La localisation d’un vaisseau dépend de son état.

## Vaisseau stationnaire

Pour un vaisseau qui n’est pas en transit :

```text
system
→ ship.nav.systemSymbol

waypoint
→ ship.nav.waypointSymbol
```

---

## Vaisseau en transit

Pendant :

```text
IN_TRANSIT
```

la table met en avant la destination.

Elle utilise :

```text
ship.nav.route.destination.systemSymbol
ship.nav.route.destination.symbol
```

La cellule indique explicitement :

```text
Destination
```

et expose également :

```text
Expected arrival
```

avec un élément sémantique :

```html
<time datetime="..."></time>
```

---

# Navigation vers Systems

La colonne Location contient des liens directs vers :

```text
System detail
Waypoint detail
```

Exemple :

```text
X1-TEST
→ /systems/X1-TEST

X1-TEST-A1
→ waypoint detail
```

Ces navigations utilisent directement les symboles présents dans le contrat Ship.

Aucune query System ou Waypoint supplémentaire n’est déclenchée avant le changement de route.

---

# Fuel

La colonne Fuel présente :

```text
current / capacity
```

lorsqu’une capacité existe.

Exemple :

```text
75 / 100
units
```

Une capacité nulle est valide.

Dans ce cas :

```text
No fuel capacity
```

est affiché.

L’application ne confond pas :

```text
capacity = 0
```

avec une donnée absente ou invalide.

---

# Cargo

La colonne Cargo présente :

```text
units / capacity
```

ainsi que le nombre de types de ressources présentes dans l’inventaire.

Exemple :

```text
20 / 40
3 item types
```

Une capacité nulle produit :

```text
No cargo capacity
```

---

# Responsive

La Fleet table possède une largeur minimale de :

```text
64rem
```

Sur un viewport plus petit :

```text
la page
→ conserve sa largeur normale

la table
→ scroll horizontal local
```

Le document entier ne doit pas déborder horizontalement à cause de la table.

La première colonne sticky conserve le contexte pendant ce déplacement.

---

# Pourquoi une table en V2 ?

La flotte contient des entités présentant toutes la même structure :

```text
identity
role
status
location
fuel
cargo
```

Une table facilite donc :

- la comparaison ;
- le scan visuel ;
- la densité d’information ;
- la cohérence avec Systems et Waypoints ;
- une lecture rapide d’une flotte plus importante.

---

# Pourquoi conserver ShipCard ?

`ShipCard.vue` n’est plus le renderer principal de la liste.

Il reste cependant présent volontairement.

Il peut servir à une future représentation :

```text
Cards
↔
Table
```

sans devoir recréer une vue carte depuis zéro.

Cette conservation n’impose aucune abstraction supplémentaire dans la version actuelle.

---

# ShipDetailPage

La fiche détaillée orchestre :

```text
route symbol
+
useShipQuery()
+
loading
+
404
+
erreur
+
refresh
+
composants de détail
```

Lorsque le symbole de route change :

```text
SHIP-A
→
SHIP-B
```

les données de `SHIP-A` ne sont pas utilisées comme placeholder de `SHIP-B`.

L’identité de la ressource a changé.

---

# Structure du détail

Le détail est composé de plusieurs composants spécialisés.

```text
ShipDetailPage
├── ShipResources
├── ShipNavigation
├── ShipCrew
├── ShipCooldown
├── ShipCargo
├── ShipEquipment
├── ShipModules
└── ShipMounts
```

Chaque composant reçoit uniquement la partie de la ressource nécessaire à sa responsabilité.

---

# Resources

`ShipResources` synthétise les capacités principales du vaisseau.

Il peut notamment présenter :

```text
fuel
cargo
crew
```

ainsi que certains avertissements.

Les capacités nulles restent des états valides.

---

# Navigation

`ShipNavigation` présente notamment :

```text
status
flight mode
system
waypoint
origin
destination
departure
arrival
```

Lorsque les symboles nécessaires sont présents, les localisations peuvent être ouvertes via les routes Systems.

---

# Crew

`ShipCrew` présente les informations d’équipage disponibles dans le contrat :

```text
current
required
capacity
rotation
morale
wages
```

Les ratios et avertissements éventuels sont calculés à partir des valeurs retournées par l’API.

---

# Cooldown

Le cooldown reste une information serveur.

Le composant affiche les valeurs fournies par SpaceTraders.

La version actuelle ne maintient pas de compte à rebours client permanent.

---

# Cargo detail

`ShipCargo` présente l’inventaire complet.

Un inventaire vide est un état valide :

```text
cargo.inventory = []
```

Il ne doit pas être interprété comme une réponse invalide.

---

# Equipment

Les informations structurées et comparables :

```text
frame
reactor
engine
```

sont regroupées dans `ShipEquipment`.

---

# Modules et Mounts

Les modules et mounts peuvent présenter des propriétés hétérogènes.

Ils ne sont donc pas forcés dans une table.

La V2 utilise des cartes indépendantes pour ces ressources :

```text
Module
→ une carte

Mount
→ une carte
```

Cela illustre la règle générale du design :

```text
données homogènes et comparables
→ table

données hétérogènes
→ surfaces indépendantes
```

---

# États vides

Les collections suivantes peuvent être légitimement vides :

```text
modules
mounts
cargo.inventory
```

Les composants possèdent alors leurs propres états vides.

Exemples :

```text
No modules installed.

No mounts installed.
```

Une propriété requise absente est différente.

Elle est rejetée par la validation Zod.

---

# Refresh

Le bouton Refresh relance la query sans supprimer immédiatement les données déjà affichées.

Le comportement attendu est :

```text
données existantes
+
isFetching
```

---

## Erreur pendant refresh

Si la query possède déjà des données valides et qu’un refresh échoue :

```text
anciennes données
→ restent visibles

erreur
→ affichée comme avertissement
```

L’écran n’est pas remplacé entièrement par un état d’erreur.

Cela permet à l’utilisateur de conserver le contexte déjà chargé.

---

# Offline

TanStack Query peut suspendre une requête lorsqu’aucune connexion n’est disponible.

Le module distingue :

```text
premier chargement offline
```

et :

```text
refresh d'une ressource déjà chargée
```

Dans le second cas, les données existantes restent visibles.

---

# Rate limiting

Une erreur HTTP :

```text
429
```

ne provoque pas de déconnexion.

Elle représente une limitation de requêtes et non une invalidation de la session.

Les données déjà disponibles restent utilisables lorsqu’elles existent.

---

# Authentification rejetée

Une erreur d’authentification est traitée globalement.

Le parcours devient :

```text
SpaceTraders rejette le token
    ↓
AuthStore nettoyé
    ↓
QueryCache nettoyé
    ↓
AppLayout détecte hasToken = false
    ↓
Login
```

Fleet n’implémente pas cette logique localement.

---

# Dates

Les dates de navigation sont formatées via les utilitaires partagés.

Les valeurs sémantiques d’origine restent conservées dans les éléments :

```html
<time datetime="..."></time>
```

lorsque cela apporte du sens à l’interface.

---

# Formatters

Les fonctions réellement génériques se trouvent dans :

```text
shared/utils/formatters.ts
```

Par exemple :

```text
formatNumber
formatDate
formatLabel
```

Les transformations propres aux vaisseaux restent dans :

```text
fleet/utils/
```

Exemples :

```text
formatPercentage
percentage
formatDuration
formatShipStatus
```

---

# Tests

Le module possède plusieurs suites complémentaires.

## `ships.spec.ts`

La liste Fleet vérifie notamment :

- utilisation du token de session ;
- fallback des paramètres d’URL invalides ;
- pagination ;
- changement de taille ;
- ouverture du vaisseau sélectionné ;
- flotte vide ;
- page hors limites ;
- réponse invalide ;
- erreur pendant refresh ;
- isolation entre deux agents.

---

## `ship-detail.spec.ts`

La fiche vérifie notamment :

- chargement du symbole demandé ;
- présentation des ressources ;
- équipement ;
- cargo ;
- probe avec capacités nulles ;
- informations facultatives absentes ;
- 404 ;
- réponse incomplète ;
- réponse contenant un autre vaisseau ;
- retry après erreur initiale ;
- erreur pendant refresh ;
- changement de symbole de route.

---

## `fleet-states.spec.ts`

Cette suite protège les états transverses :

- premier chargement hors ligne ;
- reprise après reconnexion ;
- refresh suspendu ;
- rate limiting ;
- destination pendant transit ;
- expected arrival ;
- avertissements de ressources ;
- conservation temporaire de la page précédente.

---

## Utilitaires

Les fonctions pures sont également testées séparément.

`ship-status.spec.ts` couvre les différents statuts de navigation.

`ship-formatters.spec.ts` vérifie notamment :

```text
pourcentages
clamping
capacités nulles
durées
```

---

# E2E

Le parcours Fleet fait partie du scénario principal Playwright :

```text
Login
    ↓
Agent overview
    ↓
Fleet
    ↓
Ship detail
```

Le test interagit avec la table via son nom accessible :

```text
Fleet
```

et avec les liens de détail via des noms tels que :

```text
Open ship TEST-1
```

Le scénario ne dépend donc pas d’un sélecteur CSS lié à la présentation visuelle.

---

# Choix de conception

## Server state

Les Ships restent exclusivement dans TanStack Query.

Ils ne sont pas dupliqués dans Pinia.

---

## URL state

La pagination reste dans l’URL car elle représente un état de navigation utile à l’utilisateur.

---

## Table métier séparée

`ShipTable` connaît Fleet.

`DataTable` ne connaît pas Fleet.

Cette séparation permet de partager le mécanisme de table sans déplacer les règles métier dans une abstraction générique.

---

## Cards conservées

Les cartes ne sont pas supprimées simplement parce que la représentation par défaut est devenue une table.

Elles restent disponibles pour une évolution réelle et identifiable :

```text
view mode
Cards / Table
```

---

# Limites actuelles

Le module ne gère pas actuellement :

- les mutations sur les vaisseaux ;
- le contrôle de navigation ;
- l’achat ou la vente depuis la flotte ;
- le refuel ;
- l’installation d’équipement ;
- un compte à rebours dynamique de cooldown ;
- la recherche dans la flotte ;
- le tri interactif ;
- la sélection multi-vaisseaux ;
- la persistance d’un futur mode Cards/Table.

Ces comportements pourront être ajoutés si le produit en a réellement besoin.

Ils ne sont pas intégrés prématurément à la table partagée.
