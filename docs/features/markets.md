# Markets

## Objectif

Le module `markets` permet de consulter les ressources et les informations commerciales d’un marché SpaceTraders associé à un waypoint.

L’endpoint API est techniquement imbriqué sous :

```text
/systems/{systemSymbol}/waypoints/{waypointSymbol}/market
```

mais le module reste séparé de `systems` car sa responsabilité fonctionnelle est différente :

```text
Systems
→ exploration spatiale

Markets
→ ressources, prix et transactions
```

La version actuelle est volontairement consultative.

Elle n’implémente ni achat ni vente.

---

# Périmètre

La page :

```text
/systems/:systemSymbol/waypoints/:waypointSymbol/market
```

présente trois catégories principales d’information :

```text
Market
├── Resources
├── Trade prices
└── Recent transactions
```

Ces trois catégories n’ont pas les mêmes garanties de disponibilité.

---

# Organisation du module

```text
markets/
├── api/
│   └── markets.api.ts
│
├── components/
│   ├── MarketGoodsTable.vue
│   ├── MarketResources.vue
│   └── MarketTransactionsTable.vue
│
├── composables/
│   ├── market.keys.ts
│   └── use-market-query.ts
│
├── pages/
│   └── MarketPage.vue
│
├── schemas/
│   └── market.schema.ts
│
└── tests/
    ├── market.fixture.ts
    └── market.spec.ts
```

---

# Responsabilités

| Fichier                                  | Responsabilité                                           |
| ---------------------------------------- | -------------------------------------------------------- |
| `api/markets.api.ts`                     | Récupération et va l idation d’un marché                 |
| `schemas/market.schema.ts`               | Contrat r untime Market                                  |
| `composables/market.keys.ts`             | Quer y key Market                                        |
| `composables/use-market-query.ts`        | Query TanStack du marché                                 |
| `pages/MarketPage.vue`                   | Route, états, refr e sh et composition                   |
| `components/MarketResources.vue`         | Exports, imports et exchan g e goods                     |
| `components/MarketGoodsTable.vue`        | Colonnes des prix et adaptation vers `Dat     a   Table` |
| `components/MarketTransactionsTable.vue` | Colonnes des transactions et adaptation vers `DataTable` |
| `shared/components/table/DataTable.vue`  | Infrastructure de rendu commune des table s              |
| `shared/schemas/trade-symbol.schema.ts`  | Contrat TradeSymbol partag é                             |
| `shared/utils/formatters.ts`             | Formatage des labels, nomb r es et dates                 |
| `tests/market.fixture.ts`                | Fixtures de marchés compl e ts et partiels               |
| `tests/market.spec.ts`                   | Tests d’intégration d u parcours Market                  |

`MarketPage.vue` reste un orchestrateur.

La définition des colonnes métier reste dans les composants Market, tandis que le rendu générique d’une table appartient à `DataTable`.

---

# Appel réseau

Le module utilise :

```text
GET /systems/{systemSymbol}/waypoints/{waypointSymbol}/market
```

L’appel est réalisé avec :

````ts
getMarket(`L token est tranLa fonction API ne lit pas directement Pinia.

---

# Validation runtime

La réponse SpaceTraders est validée avec Zod avant d’être retournée au reste de l’application.

Le contrat Market contient obligatoirement :

```text
symbol
exports
imports
exchange
````

et peut également contenir :

```text
tradeGoods
transactions
```

Ces deux dernières propriétés sont volontairement facultatives.

---

# Cohérence du waypoint

Après validation du schéma, la couche API vérifie :

```text
market.symbol === waypointSymbol
```

Pour :

```text
GET /systems/X1-TEST/waypoints/X1-TEST-A1/market
```

le marché retourné doit donc appartenir à :

```text
X1-TEST-A1
```

Une réponse correspondant à un autre waypoint produit :

```text
invalid-response
```

---

## Pourquoi le système n’est-il pas validé de la même manière ?

Le contrat Market retourné par SpaceTraders ne contient pas :

```text
systemSymbol
```

Le frontend ne peut donc pas vérifier directement cette relation à partir de la réponse.

Le système reste néanmoins nécessaire pour construire l’endpoint et identifier la query.

---

# Query key

La clé Market est :

```ts
;['markets', 'detail', systemSymbol, waypointSymbol]
```

Les deux symboles participent à l’identité de la requête.

;Le changeme--

# `useMarketQuery`

Le composable reçoit :

```text
systemSymbol
waypointSymbol
```

comme valeurs réactives.

La query n’est activée que lorsque :

```text
token
+
systemSymbol
+
waypointSymbol
```

sont disponibles.

Le `AbortSignal` fourni par TanStack Query est transmis jusqu’à `getMarket()`.

---

# Ressources structurelles

Les ressources structurelles du marché sont :

```text
exports
imports
exchange
```

Elles font partie du contrat obligatoire.

Contrairement aux prix ou aux transactions, leur présence ne dépend donc pas de la disponibilité des informations commerciales détaillées.

---

# MarketResources

`MarketResources.vue` présente les trois catégories :

```text
Exports
Imports
Exchange
```

dans des sections indépendantes.

Chaque section possède :

```text
titre
compteur
description du rôle de la catégorie
liste des ressources
```

La vue affiche pour chaque ressource :

```text
name
symbol
description
```

---

## Exports

Les exports représentent :

```text
Goods produced and exported from this market.
```

Un compteur expose également le nombre d’éléments.

L’état vide est :

```text
No exports reported.
```

---

## Imports

Les imports représentent les ressources actuellement recherchées par le marché.

L’état vide est :

```text
No imports reported.
```

---

## Exchange

Les exchange goods représentent les ressources achetées et vendues entre agents sur ce marché.

L’état vide est :

```text
No exchange goods reported.
```

---

# Données détaillées

Deux propriétés supplémentaires peuvent être retournées :

```text
tradeGoods
transactions
```

Elles ne sont pas garanties par le contrat Market.

Cette distinction est importante car SpaceTraders peut retourner un marché valide sans fournir ces informations détaillées.

---

# `undefined` n’est pas équivalent à `[]`

Le module distingue volontairement trois états.

```text
champ absent
→ information indisponible

champ présent avec []
→ information disponible mais aucun élément

champ présent avec des éléments
→ données disponibles
```

Exemple :

```ts
tradeGoods === undefined
```

signifie :

```text
les prix détaillés ne sont pas disponibles
```

alors que :

```ts
tradeGoods = []
```

signifie :

```text
les données détaillées sont disponibles,
mais aucun trade good n'a été retourné
```

Ces deux cas ne doivent pas produire le même message.

---

# Trade prices

Lorsque :

```text
market.tradeGoods?.length
```

est supérieur à zéro, `MarketPage` affiche :

```text
MarketGoodsTable
```

La table contient :

```text
Good
Type
Supply
Activity
Volume
Purchase
Sell
```

---

# MarketGoodsTable

La structure V2 est :

```text
MarketPage
    ↓
MarketGoodsTable
    ↓
DataTable
```

`MarketGoodsTable` possède :

```text
type métier
définition des colonnes
formatage métier
```

et délègue à `DataTable` :

```text
<table>
headers
rows
FlexRender
alignment
overflow
```

---

## Good

La première colonne utilise :

```text
symbol
```

formaté avec :

```ts
formatLabel()
```

Elle reste sticky pendant le scroll horizontal.

Cette colonne constitue l’identité de la ligne.

---

## Type

Le type peut être :

```text
EXPORT
IMPORT
EXCHANGE
```

et est formaté pour l’affichage.

---

## Supply

Le niveau de supply peut notamment être :

```text
SCARCE
LIMITED
MODERATE
HIGH
ABUNDANT
```

La valeur est présentée sous forme lisible mais reste directement dérivée du contrat serveur.

---

## Activity

`activity` est facultatif.

Lorsqu’il existe, il peut notamment contenir :

```text
WEAK
GROWING
STRONG
RESTRICTED
```

Lorsqu’il est absent, l’interface affiche explicitement :

```text
Not reported
```

Elle ne transforme pas cette absence en une valeur métier inventée.

---

## Valeurs numériques

Les colonnes :

```text
Volume
Purchase
Sell
```

sont alignées à droite.

Elles utilisent :

```text
font-mono
tabular-nums
```

afin d’améliorer la comparaison verticale des nombres.

Le formatage passe par :

```ts
formatNumber()
```

---

# DataTable Market Goods

`MarketGoodsTable` fournit au composant partagé :

```text
aria-label="Market trade prices"
min-width="60rem"
```

Sur un petit viewport, le scroll horizontal reste donc local à la table.

La colonne Good reste visible grâce à sa position sticky.

---

# Prix détaillés indisponibles

Lorsque :

```ts
market.tradeGoods === undefined
```

aucune table vide n’est affichée.

L’interface présente :

```text
Detailed prices unavailable
```

avec l’explication :

```text
SpaceTraders only exposes trade prices when one of your ships is present at this marketplace.
```

Cette situation n’est pas traitée comme une erreur.

Le Market lui-même reste valide.

---

# Prix détaillés disponibles mais vides

Lorsque :

```ts
market.tradeGoods = []
```

l’interface utilise un véritable état vide :

```text
No priced goods reported
```

avec :

```text
Detailed market data is available,
but no trade goods were returned.
```

Cela distingue clairement :

```text
aucune donnée disponible
```

et :

```text
données disponibles mais collection vide
```

---

# Recent transactions

Lorsque :

```text
market.transactions?.length
```

est supérieur à zéro, l’interface affiche :

```text
MarketTransactionsTable
```

Les colonnes sont :

```text
Good
Type
Ship
Units
Unit price
Total
Date
```

---

# MarketTransactionsTable

La structure est :

```text
MarketPage
    ↓
MarketTransactionsTable
    ↓
DataTable
```

Comme pour Trade prices, le composant métier possède les colonnes tandis que `DataTable` possède le rendu générique.

---

## Good

La première colonne contient :

```text
tradeSymbol
```

formaté avec :

```ts
formatLabel()
```

Elle reste sticky pendant le scroll horizontal.

---

## Transaction type

Le type correspond actuellement à :

```text
PURCHASE
SELL
```

et est formaté pour l’affichage.

---

# Ship symbol

Le symbole du vaisseau est affiché comme donnée technique :

```text
TEST-SHIP-1
```

en typographie monospace.

Il n’est volontairement pas transformé en lien vers Fleet.

---

## Pourquoi ne pas ouvrir le Ship automatiquement ?

Une transaction Market ne garantit pas que :

```text
shipSymbol
```

appartient à l’agent actuellement connecté.

Transformer systématiquement cette valeur en lien :

```text
/fleet/:symbol
```

pourrait donc créer une navigation vers une ressource inaccessible ou inexistante pour la session courante.

La V2 préfère conserver la valeur comme texte tant que cette propriété n’est pas connue.

---

# Valeurs numériques des transactions

Les colonnes :

```text
Units
Unit price
Total
```

sont alignées à droite et utilisent :

```text
font-mono
tabular-nums
```

Le calcul total n’est pas refait côté frontend.

L’interface affiche directement :

```text
transaction.totalPrice
```

fourni par le contrat serveur.

---

# Date

La date utilise :

```ts
formatDate()
```

pour la présentation.

La valeur originale reste disponible grâce à :

```html
<time datetime="..."></time>
```

L’information sémantique complète n’est donc pas perdue lors du formatage visuel.

---

# DataTable Transactions

`MarketTransactionsTable` utilise :

> </time

```text
aria-label="Market transactions"
min-width="64rem"
```

Comme pour les autres tables V2 :

```text
page
→ ne déborde pas horizontalement

DataTable
→ possède son propre scroll horizontal
```

---

# Historique indisponible

Lorsque :

```ts
market.transactions === undefined
```

la page affiche :

```text
Transaction history unavailable
```

avec l’explication que les transactions deviennent disponibles lorsque l’un des vaisseaux de l’agent est présent sur le marketplace.

---

# Historique disponible mais vide

Lorsque :

```ts
market.transactions = []
```

l’interface affiche :

```text
No recent transactions
```

La distinction :

```text
undefined
≠
[]
```

reste donc cohérente entre Prices et Transactions.

---

# MarketPage

`MarketPage.vue` orchestre :

```text
route params
+
useMarketQuery()
+
loading
+
offline
+
404
+
refresh
+
MarketResources
+
Trade prices
+
Recent transactions
```

Il ne possède pas la logique interne de rendu des tables.

---

# Header

Lorsque le marché est chargé, le header affiche :

```text
Marketplace
market.symbol
System
Refresh
```

Le système est directement navigable.

Le lien possède un nom accessible :

```text
Open system {systemSymbol}
```

---

# Navigation retour

La page expose en permanence :

```text
Back to waypoint
```

vers :

```text
/systems/:systemSymbol/waypoints/:waypointSymbol
```

Le lien possède :

```text
aria-label="Back to waypoint"
```

Le module `markets` n’importe pas de composant interne du module `systems`.

L’intégration passe par :

```text
route names
+
route params
```

---

# Accès au Market

La page Market est normalement ouverte depuis `WaypointDetailPage`.

L’action :

```text
Open waypoint market
```

n’est présentée que si le waypoint possède réellement le trait :

```text
MARKETPLACE
```

Un waypoint uniquement :

```text
UNCHARTED
```

avec Marketplace status :

```text
Unknown
```

ne suffit pas à afficher le bouton.

L’application ne crée donc pas une navigation Market basée sur une supposition.

---

# Premier chargement

Lorsque la query n’a encore aucune donnée :

```text
isPending
```

affiche :

```text
Loading market
```

ou, si la query est suspendue :

```text
Waiting for connection
```

---

# Offline

Lorsque la requête ne peut pas partir parce que la connexion est indisponible :

```text
The request will resume when your connection is available.
```

est présenté.

Lorsqu’un refresh est suspendu après qu’un marché a déjà été chargé, les données existantes restent visibles.

---

# Refresh

Le bouton :

```text
Refresh
```

relance la query.

Pendant l’actualisation :

```text
Updating market information…
```

est affiché.

Le bouton expose :

```text
aria-label="Refresh market"
```

et utilise l’état `loading` de `AppButton`.

---

# Erreur pendant refresh

Si une première requête a déjà réussi et qu’une actualisation échoue :

```text
market
→ reste affiché

error
→ devient un avertissement
```

Le message est :

```text
Could not refresh market
```

puis :

```text
The last successfully loaded market information is still displayed.
```

Cette règle évite de supprimer des informations valides simplement parce qu’un refresh secondaire a échoué.

---

# Erreur initiale

Lorsqu’aucune donnée n’a encore été chargée et que la requête échoue :

```text
Unable to load market
```

est affiché.

L’utilisateur peut relancer la requête avec :

```text
Try again
```

tant que l’erreur n’est pas un 404.

---

# Market not found

Un HTTP :

```text
404
```

produit un état spécifique :

```text
Market not found
```

avec :

```text
No accessible market could be found for this waypoint.
```

Le lien :

```text
Back to waypoint
```

reste disponible.

Le 404 n’est pas traité comme une erreur générique nécessitant un retry permanent.

---

# Réponse invalide

Deux catégories sont notamment rejetées :

```text
contrat Zod incomplet
```

ou :

```text
market.symbol différent du waypoint demandé
```

L’interface ne transforme jamais une réponse invalide en marché partiellement vide.

---

# Authentification

Le module Market ne possède pas de logique de session spécifique.

Si SpaceTraders rejette le token :

```text
ApiError(authentication)
    ↓
QueryCache global
    ↓
AuthStore nettoyé
    ↓
cache nettoyé
    ↓
AppLayout
    ↓
Login
```

Le comportement reste commun au reste de l’application.

---

# Tables et architecture V2

Les tables Market ont servi parmi les premiers usages de TanStack Table dans le projet.

Avec l’apparition des mêmes besoins dans :

```text
Fleet
Systems
Waypoints
Markets
```

le mécanisme de rendu commun a été extrait dans :

```text
shared/components/table/
```

La V2 utilise donc maintenant :

```text
Feature-specific table
        ↓
DataTable
        ↓
TanStack Table
```

---

# Frontière entre Market et DataTable

`MarketGoodsTable` et `MarketTransactionsTable` possèdent :

```text
types métier
colonnes
formatage
largeurs
alignements
```

`DataTable` possède :

```text
table sémantique
headers
rows
FlexRender
metadata de colonnes
aria-busy
overflow horizontal
```

Cette séparation permet de réutiliser l’infrastructure sans déplacer le comportement Market dans un composant générique.

---

# Fonctionnalités TanStack volontairement non utilisées

Le Market affiche une seule ressource avec des collections relativement petites.

La version actuelle n’ajoute donc pas :

```text
sorting
local filtering
local pagination
row selection
column visibility
virtualization
```

La présence de TanStack Table ne justifie pas à elle seule l’activation de ces fonctionnalités.

Elles pourront être ajoutées si le volume ou le besoin utilisateur l’exige réellement.

---

# Formatters partagés

Les tables réutilisent :

```ts
formatLabel()
formatNumber()
formatDate()
```

depuis :

```text
shared/utils/formatters.ts
```

Ces fonctions sont partagées car elles ne décrivent pas une règle spécifique au domaine Market.

---

# TradeSymbol partagé

Le contrat :

```text
TradeSymbol
```

est partagé entre plusieurs domaines.

Il est donc défini dans :

```text
shared/schemas/trade-symbol.schema.ts
```

plutôt que dupliqué dans Fleet et Markets.

---

# Tests

## `market.spec.ts`

La suite d’intégration couvre notamment :

```text
token de session
system demandé
waypoint demandé
marché complet
Market resources
Trade prices
Transactions
activity absente
marché partiel
tradeGoods absent
transactions absentes
collections détaillées vides
réponse incomplète
mauvais waypoint
404
refresh échoué
navigation waypoint
navigation système
```

Les réponses réseau sont simulées avec MSW.

---

## Marché complet

Le test vérifie notamment la présence de deux tables :

```text
Market trade prices
Market transactions
```

ainsi que :

```text
Exports
Imports
Exchange
Trade prices
Recent transactions
```

---

## Marché partiel

Une fixture sans :

```text
tradeGoods
transactions
```

doit encore afficher :

```text
Market resources
```

et produire :

```text
Detailed prices unavailable
Transaction history unavailable
```

Aucune table détaillée n’est créée artificiellement.

---

## Collections vides

Avec :

```ts
market.tradeGoods = []
market.transactions = []
```

le test vérifie :

```text
No priced goods reported
No recent transactions
```

et l’absence des messages :

```text
Detailed prices unavailable
Transaction history unavailable
```

Cela protège explicitement la distinction :

```text
undefined
≠
[]
```

---

## Refresh échoué

Après un chargement réussi, le test provoque une erreur pendant :

```text
Refresh market
```

et vérifie que restent visibles :

```text
Market resources
Trade prices
transactions précédentes
```

en même temps que :

```text
Could not refresh market
```

---

# E2E

Le parcours `systems-market.spec.ts` couvre l’intégration complète :

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
Waypoint
    ↓
System
```

Le scénario vérifie notamment :

```text
Market resources
Exports
Imports
Exchange
Market trade prices
Market transactions
```

ainsi que les navigations retour.

Les sélecteurs reposent sur les rôles et noms accessibles plutôt que sur la structure CSS.

---

# Pourquoi le Market reste read-only ?

Ajouter simplement :

```text
Buy
Sell
```

ne constituerait pas une fonctionnalité de trading correcte.

Une mutation complète devrait tenir compte de plusieurs domaines.

```text
Market
├── prix courant
└── waypoint

Ship
├── présence au waypoint
├── état de navigation
└── cargo disponible

Agent
└── credits
```

Il faudrait ensuite gérer :

```text
quantité
état pending
erreurs métier
double soumission
mise à jour du Ship
mise à jour du Market
mise à jour des crédits Agent
invalidation des queries concernées
```

Cette fonctionnalité traverserait donc :

```text
markets
fleet
agent
```

Elle est laissée hors périmètre plutôt que d’être implémentée partiellement.

---

# Choix de conception

## Module séparé

Markets reste distinct de Systems car le domaine commercial possède maintenant :

```text
API
schema
query
page
components
tests
```

propres.

---

## Données serveur

Le Market reste exclusivement dans TanStack Query.

Il n’est pas dupliqué dans Pinia.

---

## Informations absentes

Le frontend conserve la sémantique exacte du contrat SpaceTraders :

```text
propriété optionnelle absente
≠
collection vide
```

---

## Pas de lien Ship spéculatif

Un `shipSymbol` provenant d’une transaction n’est pas considéré comme un vaisseau appartenant automatiquement à la session actuelle.

---

## DataTable partagé

La base de table est partagée uniquement pour les responsabilités réellement communes.

Les définitions métier restent dans Markets.

---

# Limites actuelles

La version actuelle n’implémente pas :

```text
buy
sell
choix d'un vaisseau
quantité de transaction
validation cargo
validation crédits
refresh automatique des prix
historique paginé
sorting
filtering
column visibility
virtualization
graphiques de prix
comparaison entre plusieurs markets
planification commerciale
```

Ces fonctionnalités pourront être ajoutées si un besoin produit concret les justifie.

La V2 privilégie pour l’instant une consultation fiable et explicite des données réellement fournies par SpaceTraders.
