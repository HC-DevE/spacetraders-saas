# Systems and waypoints

Le module `systems` permet d’explorer les systèmes connus, d’ouvrir un système, de parcourir ses waypoints et de consulter le détail d’un waypoint.

Les marchés ne sont pas implémentés dans ce module : un waypoint avec le trait `MARKETPLACE` expose seulement une navigation vers le module `markets`.

## Périmètre

### Liste des systèmes

La page `/systems` affiche :

- le nom et le symbole du système ;
- son type et son secteur ;
- sa constellation lorsqu’elle est fournie ;
- ses coordonnées ;
- le nombre de waypoints connus ;
- les factions présentes ;
- un bouton permettant d’ouvrir le détail du système.

La liste dispose d’une pagination serveur et d’une actualisation manuelle.

### Détail d’un système

La page `/systems/:systemSymbol` charge séparément :

- le système demandé ;
- la liste paginée de ses waypoints.

Cette séparation est volontaire : un échec de la liste des waypoints ne masque pas les informations du système déjà chargées.

La liste des waypoints affiche notamment :

- le symbole et le type ;
- les coordonnées ;
- le nombre d’orbitals ;
- la faction lorsqu’elle est fournie ;
- les traits retournés par l’API ;
- l’état de construction ;
- un bouton vers le détail du waypoint.

Un filtre simple « Marketplace only » est proposé. Il représente un besoin fonctionnel de l’interface et est traduit vers le trait API `MARKETPLACE` dans la couche de données.

### Détail d’un waypoint

La page `/systems/:systemSymbol/waypoints/:waypointSymbol` présente :

| Section   | Informations                                                                               |
| --------- | ------------------------------------------------------------------------------------------ |
| Overview  | Type, système, coordonnées, faction, construction, marché, parent orbit, orbitals et chart |
| Traits    | Nom et description des traits retournés                                                    |
| Modifiers | Modificateurs lorsqu’ils sont fournis                                                      |
| Orbitals  | Liens vers les waypoints orbitaux                                                          |
| Chart     | Informations de chart lorsqu’elles sont disponibles                                        |

Les liens de relation exploitent les routes existantes : système parent, parent orbit et orbitals.

Un bouton `Open market` est affiché uniquement lorsque le trait `MARKETPLACE` est connu.

## Waypoints non cartographiés

Un waypoint avec le trait `UNCHARTED` peut masquer ses véritables traits.

Dans ce cas, l’absence de `MARKETPLACE` ne permet pas de conclure qu’aucun marché n’existe. L’interface affiche donc :

```text
Marketplace
Unknown
```

et n’invente pas de trait absent de la réponse.

Pour un waypoint cartographié sans trait `MARKETPLACE`, l’interface affiche `No marketplace trait`.

Cette logique est centralisée dans `utils/waypoint-status.ts` plutôt que dupliquée dans les composants.

## Responsabilités des fichiers

| Fichier ou dossier                   | Responsabilité                                                   |
| ------------------------------------ | ---------------------------------------------------------------- |
| `api/systems.api.ts`                 | Liste et détail des systèmes, validation des réponses            |
| `api/waypoints.api.ts`               | Liste et détail des waypoints, validation des réponses           |
| `schemas/system.schema.ts`           | Contrat d’un système                                             |
| `schemas/systems.schema.ts`          | Pagination et réponse de liste des systèmes                      |
| `schemas/waypoint.schema.ts`         | Contrat complet d’un waypoint                                    |
| `schemas/waypoints.schema.ts`        | Pagination, filtre Marketplace et réponse de liste des waypoints |
| `composables/system.keys.ts`         | Clés TanStack Query des systèmes                                 |
| `composables/waypoint.keys.ts`       | Clés TanStack Query des waypoints                                |
| `composables/use-systems-query.ts`   | Query paginée des systèmes                                       |
| `composables/use-system-query.ts`    | Query d’un système                                               |
| `composables/use-waypoints-query.ts` | Query paginée des waypoints                                      |
| `composables/use-waypoint-query.ts`  | Query d’un waypoint                                              |
| `pages/SystemsPage.vue`              | Composition et états de la liste des systèmes                    |
| `pages/SystemDetailPage.vue`         | Composition du système et de ses waypoints                       |
| `pages/WaypointDetailPage.vue`       | Composition et états du détail waypoint                          |
| `components/SystemCard.vue`          | Résumé d’un système                                              |
| `components/SystemOverview.vue`      | Informations du système                                          |
| `components/WaypointList.vue`        | Liste, pagination et filtre Marketplace                          |
| `components/WaypointOverview.vue`    | Présentation du détail waypoint et liens associés                |
| `utils/waypoint-status.ts`           | Règles pures liées aux traits et au statut Marketplace           |
| `shared/utils/formatters.ts`         | Formatage générique des libellés et dates                        |
| `tests/`                             | Tests d’intégration, fixtures et logique pure                    |

Les composants reçoivent directement les types déduits des schémas Zod. Aucun modèle de présentation intermédiaire n’est créé uniquement pour faciliter le rendu.

## Appels réseau

```text
GET /systems?page={page}&limit={limit}
GET /systems/{systemSymbol}
GET /systems/{systemSymbol}/waypoints?page={page}&limit={limit}
GET /systems/{systemSymbol}/waypoints?page={page}&limit={limit}&traits=MARKETPLACE
GET /systems/{systemSymbol}/waypoints/{waypointSymbol}
```

Le token est passé explicitement aux fonctions API.

Après validation Zod :

- la page et la limite retournées doivent correspondre à la demande ;
- un système de détail doit correspondre au symbole demandé ;
- tous les waypoints d’une liste doivent appartenir au système demandé ;
- un waypoint de détail doit correspondre au système et au symbole demandés.

Une incohérence produit une erreur `invalid-response` et aucune valeur n’est inventée.

## Pagination et filtre Marketplace

### Systems

```text
/systems?page=2&limit=20
```

- Page par défaut : `1`.
- Taille par défaut : `10`.
- Tailles proposées : `10` et `20`.
- Les paramètres invalides utilisent les valeurs par défaut.
- Changer la taille ramène à la première page.

### Waypoints

```text
/systems/X1-TEST?page=2&limit=10&marketplace=true
```

La route frontend conserve un filtre simple `marketplace=true`.

La couche API le traduit en :

```text
traits=MARKETPLACE
```

Ce choix évite d’exposer dans l’interface tous les filtres techniques possibles de SpaceTraders alors qu’ils ne répondent pas à un besoin produit actuel.

Changer la taille de page ou le filtre Marketplace ramène à la première page.

Lors d’un changement de page compatible, TanStack Query peut conserver temporairement les résultats précédents. Ils ne sont pas réutilisés si la taille de page ou le filtre Marketplace change.

### Pourquoi le filtrage reste volontairement limité

L’API SpaceTraders permet d’aller plus loin que le filtre actuellement exposé dans l’interface. La liste des waypoints peut notamment être filtrée par type et par plusieurs traits.

Une version plus complète pourrait donc permettre des recherches du type :

```text
type=PLANET
traits=MARKETPLACE
traits=SHIPYARD
```

Ce support n’a pas été oublié : il a été volontairement écarté de cette version.

Une première réflexion autour d’un système de filtres plus générique faisait apparaître plusieurs responsabilités supplémentaires :

- définir un modèle de filtres propre à l’application ;
- choisir un contrat d’URL frontend indépendant de celui de SpaceTraders ;
- convertir les valeurs lisibles de l’URL vers les enums API ;
- supporter plusieurs traits simultanément ;
- normaliser leur ordre pour conserver des query keys stables ;
- remettre correctement la pagination à zéro lorsqu’un filtre change ;
- décider quelles données peuvent rester en placeholder pendant un changement de filtre ;
- concevoir une interface capable d’exposer un grand nombre de traits sans surcharger l’écran.

Implémenter seulement une partie de cette logique aurait créé davantage de couplage et de cas particuliers que de valeur fonctionnelle.

Le choix retenu est donc de conserver un besoin utilisateur concret :

```text
Marketplace only
```

qui est traduit dans la couche API vers :

```text
traits=MARKETPLACE
```

Ce filtre sert directement le parcours principal de l’application :

```text
System
→ Waypoint avec Marketplace
→ Market
```

Il permet également de conserver une séparation claire entre le contrat de navigation frontend et le contrat HTTP.

Si les filtres devaient évoluer, l’approche privilégiée serait d’introduire un modèle de filtres applicatif explicite, puis un adaptateur chargé de produire les query params SpaceTraders. L’URL frontend ne devrait pas simplement recopier le contrat de l’API externe.

Ce choix suit les principes KISS et YAGNI appliqués au reste du projet : terminer et sécuriser le parcours principal avant d’augmenter la surface fonctionnelle.

## Cache

Les clés principales sont :

```ts
;['systems', 'list', { page, limit }][('systems', 'detail', systemSymbol)][
  ('waypoints', 'list', systemSymbol, params)
][('waypoints', 'detail', systemSymbol, waypointSymbol)]
```

Chaque paramètre qui modifie les données demandées participe à la clé.

Les clés n’incluent ni token ni identifiant de session. Le changement d’agent est protégé par le nettoyage global du QueryCache effectué par le flux d’authentification.

## États d’interface

| Situation                    | Comportement                                        |
| ---------------------------- | --------------------------------------------------- |
| Premier chargement           | État de chargement dédié                            |
| Requête suspendue hors ligne | Message d’attente de connexion                      |
| Chargement réussi            | Affichage des données                               |
| Liste vide                   | État vide explicite                                 |
| Page hors limites            | Message dédié et retour possible à la première page |
| Erreur initiale              | Message d’erreur et relance                         |
| Actualisation                | Données existantes conservées                       |
| Échec d’actualisation        | Données précédentes conservées avec avertissement   |
| System 404                   | État `System not found`                             |
| Waypoint 404                 | État `Waypoint not found`                           |
| Réponse invalide             | Erreur dédiée, sans valeurs de remplacement         |
| `UNCHARTED`                  | Marketplace affiché comme inconnu                   |

## Navigation croisée

La feature Systems est reliée au reste de l’application :

- l’Overview de l’agent peut ouvrir son headquarters ;
- les cartes et détails de vaisseaux peuvent ouvrir leur système et leurs waypoints ;
- un waypoint peut ouvrir son système parent, son parent orbit et ses orbitals ;
- un waypoint Marketplace peut ouvrir son marché ;
- la page Market permet de revenir au waypoint et d’ouvrir le système parent.

Ces liens utilisent uniquement des identifiants réellement présents dans les données. Aucun lien vers une ressource supposée n’est fabriqué.

## Tests

### `systems.spec.ts`

Vérifie notamment :

- transmission du token ;
- fallback des paramètres d’URL invalides ;
- pagination et changement de taille ;
- liste vide et page hors limites ;
- réponse imbriquée invalide ;
- pagination incohérente ;
- conservation des données après un échec d’actualisation ;
- absence de fuite du cache de l’agent précédent ;
- navigation vers le détail d’un système.

### `system-detail.spec.ts`

Vérifie notamment :

- chargement indépendant du système et des waypoints ;
- conservation du système si les waypoints échouent ;
- pagination des waypoints ;
- filtre Marketplace et conservation dans l’URL ;
- reset de la pagination lorsque le filtre change ;
- comportement `UNCHARTED` ;
- réponses waypoints invalides ;
- conservation des waypoints lors d’un refresh échoué ;
- système introuvable ou symbole incohérent ;
- navigation vers le détail d’un waypoint.

### `waypoint-detail.spec.ts`

Vérifie notamment :

- chargement avec le token actif ;
- liens système, parent orbit et orbitals ;
- modifiers et chart ;
- Marketplace inconnu sur un waypoint `UNCHARTED` ;
- réponses incomplètes ou incohérentes ;
- 404 ;
- retry après une erreur initiale ;
- conservation des données après un refresh échoué ;
- ouverture du marché uniquement lorsque `MARKETPLACE` est connu.

### `waypoint-status.spec.ts`

Vérifie la détection des traits et la règle de statut Marketplace.

Les tests d’intégration utilisent MSW et ne dépendent pas d’un compte SpaceTraders réel.

### `systems-market.spec.ts`

Un parcours Playwright transversal complète les tests d’intégration.

Il vérifie le scénario critique :

```text
Connexion
→ Systems
→ System detail
→ Waypoint detail
→ Market
→ retour Waypoint
→ retour System
→ retour Systems
```

## Limites, choix de périmètre et évolutions possibles

Plusieurs fonctionnalités ont été volontairement laissées hors de cette version afin de conserver un module simple et correctement testé.

### Filtrage

Seul le filtre Marketplace est exposé.

Les filtres génériques par type et par traits multiples seraient une évolution logique, mais ils méritent un vrai modèle de filtrage plutôt qu’une accumulation de paramètres directement couplés à SpaceTraders.

### Exploration visuelle

Aucune carte graphique du système n’est proposée.

Les coordonnées sont disponibles et pourraient permettre ultérieurement :

- une carte 2D des waypoints ;
- une représentation des relations orbitales ;
- une visualisation de la position des vaisseaux ;
- une navigation plus spatiale entre les ressources.

Cette fonctionnalité aurait demandé un effort UI important sans améliorer les responsabilités principales évaluées dans cette version.

### Recherche

Il n’existe pas de recherche globale par symbole.

Une recherche uniquement appliquée à la page actuellement chargée aurait été trompeuse puisqu’elle n’aurait pas réellement recherché dans l’ensemble des systèmes SpaceTraders.

### Préchargement

Le détail de chaque waypoint n’est pas préchargé depuis la liste.

La réponse de liste contient suffisamment d’informations pour son affichage. Charger automatiquement le détail de chaque élément aurait créé un nombre de requêtes inutilement élevé.

### Contexte de navigation

Le lien `Back to system` retourne vers la route canonique du système.

Il ne restaure actuellement pas la page et le filtre Marketplace précédemment sélectionnés.

Le bouton retour natif du navigateur conserve naturellement cet historique.

Une amélioration possible consisterait à transmettre explicitement un contexte de retour ou à conserver certains paramètres de navigation, mais ce comportement n’a pas été ajouté uniquement pour masquer un cas d’usage secondaire.

### Actualisation

Il n’y a pas de polling automatique.

Les données peuvent être actualisées manuellement et TanStack Query gère également les comportements liés à la reconnexion.

Un polling régulier devrait être ajouté uniquement si un besoin produit justifie la fraîcheur supplémentaire des données et son coût réseau.

### Validation finale

La recette manuelle doit encore confirmer :

- les différentes largeurs d’écran ;
- les textes longs ;
- la navigation clavier ;
- la visibilité du focus ;
- les débordements ;
- les pages vides ;
- le rechargement direct des routes profondes après déploiement.

La réussite des tests automatisés ne remplace pas cette validation visuelle.
