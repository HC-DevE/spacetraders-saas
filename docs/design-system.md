# Design system

## Objectif

Le design system de Space Control définit le langage visuel et les conventions d’interface partagés par l’application.

Il sert deux objectifs complémentaires :

```text
cohérence produit
+
référence de développement
```

La version V2 privilégie une interface de type :

```text
control center
```

adaptée à des données :

```text
techniques
structurées
opérationnelles
```

plutôt qu’un dashboard composé principalement de grandes cartes décoratives.

---

# Principes

Le langage visuel suit plusieurs règles simples.

## Information first

Le contenu doit rester prioritaire sur la décoration.

Les informations principales sont notamment :

```text
identity
status
location
resources
relationships
actions
```

La hiérarchie est créée principalement avec :

```text
typography
spacing
borders
alignment
color
```

---

## Flat surfaces

Les surfaces utilisent principalement :

```text
background
border
spacing
```

La V2 limite volontairement :

```text
large shadows
large radiuses
floating cards
decorative effects
```

---

## Signal color is meaningful

La couleur Signal n’est pas utilisée comme couleur décorative générique.

Elle représente principalement :

```text
active
available
interactive
important
```

Exemples :

```text
active navigation
Marketplace available
important links
interaction hover states
```

---

## Structured data uses structured presentation

Les informations homogènes et comparables utilisent principalement :

```text
tables
definition lists
aligned technical values
```

Les cards restent utilisées lorsque les informations sont réellement hétérogènes.

---

# Palette

La palette principale est :

| Token  | Value     | Role                        |
| ------ | --------- | --------------------------- |
| Ink    | `#0c0d10` | Application background      |
| Panel  | `#16181c` | Secondary surfaces          |
| Signal | `#e8a33d` | Live and interactive accent |
| Orbit  | `#7c9cb8` | Informational state         |
| Alert  | `#c1594a` | Critical state              |
| Paper  | `#e8e6e1` | Primary content             |

Les noms représentent le rôle du token plutôt qu’un simple nom de couleur.

---

## Ink

```text
#0c0d10
```

Ink représente le fond principal de l’application.

Il fournit la base visuelle sur laquelle se détachent :

```text
Panel
Paper
Signal
Orbit
Alert
```

---

## Panel

```text
#16181c
```

Panel représente les surfaces secondaires.

Il est utilisé pour distinguer un contenu structuré du fond principal sans créer l’effet d’une carte flottante.

---

## Signal

```text
#e8a33d
```

Signal représente les informations actives ou réellement actionnables.

Exemples :

```text
Marketplace available
navigation active
important interaction
```

---

## Orbit

```text
#7c9cb8
```

Orbit représente principalement une information secondaire ou technique.

Exemple :

```text
resource type
```

---

## Alert

```text
#c1594a
```

Alert est réservé aux états critiques ou destructifs.

Un état vide ou une information indisponible ne doit pas automatiquement être présenté comme une erreur.

---

## Paper

```text
#e8e6e1
```

Paper représente le contenu clair principal.

Un blanc légèrement cassé est préféré à un blanc pur sur le fond sombre.

---

# Typography

Space Control utilise deux familles complémentaires.

```text
IBM Plex Sans
→ interface

IBM Plex Mono
→ technical data
```

---

## IBM Plex Sans

Utilisé pour :

```text
headings
labels
buttons
navigation
descriptions
feedback
```

---

## IBM Plex Mono

Utilisé lorsque la nature technique de la donnée doit rester visible.

Exemples :

```text
TEST-SHIP-1
X1-TEST-A1
42, -18
125,000
```

Cela concerne notamment :

```text
symbols
coordinates
numeric values
technical identifiers
```

---

# Numeric values

Les valeurs numériques comparables peuvent utiliser :

```text
font-mono
tabular-nums
```

Cette convention améliore leur alignement vertical dans les tables.

---

# Application shell

Les écrans authentifiés utilisent :

```text
AppLayout
├── AppHeader
├── AppNavigation
└── main content
```

Le Design System ne reconstruit pas une seconde version de ce shell.

Il documente les primitives et conventions utilisées par celui-ci.

---

# AppHeader

Le header réel de l’application contient :

```text
Space Control identity
agent symbol
sign out
```

Le branding utilise l’image placée dans :

```text
/public/favicon.jpg
```

avec le texte :

```text
Space Control
```

Lorsque le texte fournit déjà le nom accessible, l’image peut rester décorative.

---

# Navigation

La navigation principale contient actuellement :

```text
Overview
Fleet
Systems
```

La V2 évite des onglets représentés par de grandes pills remplies.

L’état actif repose principalement sur :

```text
typography
Signal accent
active indicator
```

L’accessibilité utilise également :

```text
aria-current
```

pour distinguer une page exacte d’une section active.

---

# Actions

Les actions utilisent le composant partagé :

```text
AppButton
```

La page `/design-system` expose directement les variantes réellement disponibles.

Exemples :

```text
Primary
Secondary
Outline
Ghost
Destructive
```

Elle expose également des états :

```text
disabled
loading
small action
```

La page de référence n’ajoute pas de styling spécifique afin de masquer le comportement réel du composant.

---

# Compact actions

Certaines actions secondaires utilisent une taille compacte.

Exemples dans le produit :

```text
Refresh
Sign out
```

Elles doivent rester clairement interactives sans concurrencer le titre ou les données principales.

---

# Inputs

Les champs reposent sur les primitives partagées :

```text
Input
Label
```

La référence actuelle présente :

```text
standard input
supporting text
token/password field
invalid field
disabled field
```

---

# Token visibility

Le pattern de visibilité utilisé par Login est également présent dans la page Design System.

Il utilise :

```text
Eye
EyeOff
```

depuis :

```text
@lucide/vue
```

Le changement d’état ne dépend pas uniquement de l’icône.

Le contrôle possède également :

```text
aria-pressed
aria-controls
dynamic aria-label
```

---

# Icons

Les icônes génériques proviennent de :

```text
@lucide/vue
```

Cela évite de maintenir manuellement des SVG déjà représentés dans une bibliothèque commune.

Lorsqu’une icône accompagne une action déjà nommée :

```text
aria-hidden="true"
```

est utilisé pour éviter une information redondante.

---

# Feedback

Les états initiaux utilisent le composant partagé :

```text
FeedbackState
```

La page de référence présente notamment :

```text
loading
empty
error
```

Ces états restent distincts.

---

# Refresh states

Un refresh secondaire ne doit pas être traité comme un premier chargement.

Lorsque des données existent déjà :

```text
existing data
+
refresh status
```

peuvent rester visibles simultanément.

En cas d’échec :

```text
existing data
+
refresh warning
```

restent affichés.

Le Design System présente donc séparément :

```text
initial error
```

et :

```text
refresh error
```

---

# Empty states

Une collection vide est un état métier valide.

Elle ne doit pas être confondue avec :

```text
network error
invalid response
missing information
```

Exemples dans le produit :

```text
No modules installed.
No mounts installed.
No priced goods reported.
No recent transactions.
```

---

# Missing versus empty

Lorsque le contrat serveur distingue :

```text
undefined
```

de :

```text
[]
```

l’interface conserve cette distinction.

Exemple :

```text
tradeGoods === undefined
→ Detailed prices unavailable

tradeGoods = []
→ No priced goods reported
```

---

# Data display

Les collections structurées utilisent la base :

```text
DataTable
```

actuellement partagée par :

```text
Fleet
Systems
Waypoints
Market trade prices
Market transactions
```

La page Design System utilise elle-même le vrai `DataTable`.

Elle ne contient pas de reproduction statique de son apparence.

---

# Semantic tables

`DataTable` produit une véritable structure :

```html
<table>
  <thead></thead>
  <tbody>
    <tr>
      <th></th>
      <td></td>
    </tr>
  </tbody>
</table>
```

La V2 n’utilise pas un assemblage de `div` en CSS Grid pour imiter une table lorsque les données sont réellement tabulaires.

---

# Sticky identity column

Les tables importantes conservent généralement leur colonne d’identité pendant le scroll horizontal.

Exemples :

```text
Ship
System
Waypoint
Good
```

Le Design System démontre ce comportement avec sa colonne :

```text
Asset
```

---

# Horizontal overflow

Le scroll horizontal appartient au conteneur de la table.

```text
page
→ keeps normal width

DataTable
→ overflow-x-auto
```

Le viewport complet ne doit pas déborder à cause d’une table.

---

# Column alignment

Les colonnes textuelles sont généralement alignées à gauche.

Les valeurs numériques comparables utilisent principalement :

```text
right alignment
+
monospace
+
tabular numbers
```

Le DataTable de référence montre par exemple :

```text
Capacity
Value
```

alignées à droite.

---

# Column metadata

Les features contrôlent leur présentation grâce aux metadata des colonnes.

Exemples :

```text
align
className
headerClassName
cellClassName
```

Cela permet de conserver :

```text
generic table rendering
```

tout en laissant :

```text
feature-specific presentation
```

dans le module concerné.

---

# Structured surfaces

Toutes les informations ne doivent pas devenir des tables.

Le Design System présente également une grille basée sur :

```html
<dl></dl>
```

pour représenter :

```text
Type
Coordinates
Marketplace
```

Ce pattern est notamment utilisé dans les pages de détail.

---

# Heterogeneous surfaces

Les informations descriptives indépendantes utilisent encore des surfaces dédiées.

Exemples :

```text
Waypoint traits
Waypoint modifiers
Ship modules
Ship mounts
```

Le Design System présente deux exemples :

```text
Marketplace
Temporary modifier
```

pour illustrer cette différence.

---

# Tables versus cards

La règle générale est :

```text
homogeneous collection
+
comparable values
→ table
```

alors que :

```text
heterogeneous descriptive content
→ independent surface
```

Cette distinction explique notamment :

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

---

# Existing card components

Les composants :

```text
ShipCard
SystemCard
```

restent présents.

Ils ne sont simplement plus la représentation principale des listes V2.

Ils pourront être réutilisés si un vrai mode :

```text
Cards
↔
Table
```

est ajouté ultérieurement.

---

# Responsive behavior

La V2 ne convertit pas automatiquement toutes les tables en cards sur petit écran.

Le comportement principal est :

```text
grids
→ collapse

tables
→ horizontal scroll inside DataTable

main content
→ remains constrained
```

Cela conserve la structure des données sans créer deux présentations complètement différentes à maintenir.

---

# Accessibility

Les conventions d’accessibilité font partie des primitives elles-mêmes.

Exemples :

```text
semantic HTML
aria-label
aria-current
aria-busy
aria-invalid
aria-describedby
aria-controls
aria-pressed
role="alert"
role="status"
skip link
visible focus
```

---

# Accessible actions

Les actions utilisent des noms accessibles explicites.

Exemples réels :

```text
Open ship TEST-1
Open system X1-TEST
View waypoint X1-TEST-A1
Open waypoint market
Refresh market
Back to waypoint
```

Les tests E2E utilisent ces mêmes noms lorsque cela est possible.

Cela rapproche :

```text
test contract
```

et :

```text
accessibility contract
```

---

# Development reference page

La route :

```text
/design-system
```

n’existe qu’en environnement de développement.

Elle est utilisée comme référence visuelle et technique.

La page est organisée autour de :

```text
Foundations
Actions
Inputs
Feedback
Data display
Structured surfaces
```

---

# Foundations

Cette section expose réellement :

```text
palette
IBM Plex Sans
IBM Plex Mono
technical values
```

---

# Actions

Cette section rend directement les variantes du véritable :

```text
AppButton
```

Elle peut donc révéler une incohérence du composant partagé au lieu de la masquer avec un style spécifique à la documentation.

---

# Inputs

Cette section réutilise les vrais :

```text
Input
Label
AppButton
Eye / EyeOff
```

Elle couvre notamment le pattern utilisé par Login.

---

# Feedback

Cette section utilise réellement :

```text
FeedbackState
```

pour les états initiaux.

Les refresh states sont présentés séparément car ils ont une sémantique différente.

---

# Data display

Cette section rend une véritable instance de :

```text
DataTable
```

avec :

```text
typed data
typed columns
sticky identity column
statuses
technical values
right-aligned numeric columns
```

Elle protège ainsi le langage visuel partagé des tables.

---

# Structured surfaces

Cette section montre les deux catégories utilisées par les pages détaillées :

```text
structured comparable metadata
→ definition list

heterogeneous descriptive data
→ independent surfaces
```

---

# Pourquoi la page ne simule pas Fleet ou Systems ?

L’ancienne version du Design System reproduisait davantage un écran produit fictif.

La V2 préfère tester directement les primitives.

Cela évite de maintenir :

```text
real Fleet UI
+
fake Fleet UI in Design System
```

qui pourraient diverger.

La page de référence documente les composants et les conventions.

Les vraies pages métier restent la référence pour leur composition finale.

---

# Source of truth

Le Design System suit cette hiérarchie :

```text
shared primitives
        ↓
feature components
        ↓
real application pages
        ↓
development reference
        ↓
documentation
```

La documentation décrit donc le comportement effectivement présent dans le projet.

Elle n’introduit pas de nouveaux patterns uniquement sur le papier.

---

# Tests

`App.spec.ts` protège l’intégration de la route Design System.

Il vérifie notamment la présence des sections :

```text
Foundations
Actions
Inputs
Feedback
Data display
Structured surfaces
```

Il vérifie également que le vrai DataTable de démonstration contient ses données attendues.

Les comportements métier Fleet, Systems ou Markets ne sont pas testés depuis cette page.

Ils restent dans leurs suites respectives.

---

# Évolutions possibles

Le Design System pourra évoluer avec les besoins du produit.

Exemples :

```text
Cards / Table view mode
sorting controls
search controls
advanced filters
additional status patterns
charts
automated accessibility checks
```

Ces patterns seront ajoutés au Design System lorsqu’ils auront d’abord un usage concret dans l’application.
