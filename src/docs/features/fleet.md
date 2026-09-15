# Fleet

Le module `fleet` permet de consulter les vaisseaux de l’agent connecté et les informations détaillées de chacun.

Le nom du module représente le périmètre fonctionnel de la flotte.
Les fonctions API et les clés de cache utilisent `ships`, qui désigne la ressource manipulée.

## Périmètre

### Liste des vaisseaux

La page `/fleet` affiche :

- l’identité, le rôle et le modèle du vaisseau ;
- son statut et son mode de vol ;
- son système et son waypoint ;
- sa destination et son arrivée prévue lorsqu’il est en transit ;
- le carburant disponible ;
- l’occupation de la cargaison ;
- un bouton permettant d’ouvrir sa fiche détaillée.

La liste dispose d’une pagination serveur et d’une actualisation manuelle.

### Détail d’un vaisseau

La page `/fleet/:symbol` rassemble les sections suivantes :

| Section                | Informations                                                      |
| ---------------------- | ----------------------------------------------------------------- |
| Ressources             | Carburant, cargaison, équipage et avertissements associés         |
| Navigation             | Système, waypoint, origine, destination et dates du trajet        |
| Équipage               | Rotation, moral et rémunération                                   |
| Cooldown               | Durées retournées par l’API et expiration lorsqu’elle est fournie |
| Cargaison              | Ressources transportées et quantités                              |
| Équipements principaux | Frame, reactor et engine                                          |
| Modules                | Une carte par module installé                                     |
| Mounts                 | Une carte par mount installé et ses propriétés disponibles        |

Les actions de navigation, d’achat, de vente ou de modification du vaisseau
ne sont pas implémentées.

## Responsabilités des fichiers

| Fichier ou dossier               | Responsabilité                                             |
| -------------------------------- | ---------------------------------------------------------- |
| `api/ships.api.ts`               | Appels de liste et de détail, validation des réponses      |
| `schemas/ship.schema.ts`         | Contrat d’un vaisseau et enveloppe de la réponse de détail |
| `schemas/ships.schema.ts`        | Pagination, paramètres d’URL et réponse de liste           |
| `composables/ship.keys.ts`       | Clés TanStack Query communes                               |
| `composables/use-ships-query.ts` | Query paginée                                              |
| `composables/use-ship-query.ts`  | Query d’un vaisseau                                        |
| `pages/FleetPage.vue`            | Composition et états de la liste                           |
| `pages/ShipDetailPage.vue`       | Composition et états de la fiche                           |
| `components/ShipCard.vue`        | Résumé d’un vaisseau dans la liste                         |
| `components/ship-detail/`        | Sections de la fiche détaillée                             |
| `utils/ship-formatters.ts`       | Formatage des nombres, dates, durées et pourcentages       |
| `utils/ship-status.ts`           | Libellés et couleurs des statuts                           |
| `tests/`                         | Tests de parcours et de présentation                       |

Les composants de détail reçoivent directement les données typées
nécessaires à leur section.

Les schémas de liste et de détail réutilisent le même contrat de vaisseau.
La réponse de liste contient un tableau et des métadonnées ; la réponse
de détail contient un seul vaisseau.

## Appels réseau

```text
GET /my/ships?page={page}&limit={limit}
GET /my/ships/{symbol}
```

Le token est passé explicitement aux fonctions API.

Après validation Zod :

- la page et la limite retournées doivent correspondre à la demande ;
- le symbole du vaisseau retourné doit correspondre au symbole demandé.

Une incohérence produit une erreur de réponse invalide.

## Pagination

Les paramètres sont conservés dans l’URL.

```text
/fleet?page=2&limit=10
```

- Page par défaut : `1`.
- Taille par défaut : `10`.
- Tailles proposées : `1`, `5`, `10` et `20`.
- Les paramètres d’URL invalides utilisent les valeurs par défaut.
- Changer la taille de page ramène à la première page.
- Les changements de pagination utilisent `router.replace()`.

Lors du chargement d’une autre page avec la même taille, les résultats
précédents restent visibles avec une indication explicite.

Ils ne sont pas réutilisés comme contenu temporaire lorsque la taille
de page change.

## Cache

Les clés sont :

```ts
;['ships', 'list', { page, limit }][('ships', 'detail', symbol)]
```

Elles n’incluent ni token ni identifiant de session.

Le nettoyage du cache au login, au logout et au rejet du token est
coordonné par l’authentification et la configuration de TanStack Query.

La configuration actuelle considère les données comme fraîches pendant
30 secondes. Les queries inactives peuvent rester en cache pendant
5 minutes.

Il n’y a pas de polling régulier. Une reconnexion réseau peut relancer
une query selon son état, et l’utilisateur peut actualiser les données.

## États d’interface

| Situation                       | Comportement                                                |
| ------------------------------- | ----------------------------------------------------------- |
| Premier chargement              | État de chargement                                          |
| Hors ligne avant le chargement  | Message d’attente de connexion                              |
| Chargement réussi               | Affichage des données                                       |
| Flotte vide                     | Message « No ships yet »                                    |
| Page vide au-delà des résultats | Message dédié et retour à la première page                  |
| Erreur sans données             | Message d’erreur et action de relance                       |
| Actualisation                   | Données conservées avec indication de mise à jour           |
| Échec d’actualisation           | Données précédentes conservées et avertissement             |
| Limitation HTTP 429             | Message d’erreur sans déconnexion                           |
| Rejet d’authentification        | Suppression du token, nettoyage du cache et retour au login |
| Détail introuvable              | Message « Ship not found » et retour à la flotte            |
| Réponse invalide                | Erreur dédiée, sans inventer de valeurs                     |
| Changement de vaisseau          | Les données du précédent ne servent pas de placeholder      |

## Données absentes et capacités nulles

Une sonde peut avoir des capacités de carburant, de cargaison et
d’équipage égales à zéro. Ces valeurs sont valides.

L’interface distingue :

- une absence de capacité ;
- une capacité disponible mais actuellement vide ;
- une information facultative absente ;
- une réponse ne respectant pas le contrat attendu.

Les tableaux `modules`, `mounts` et `cargo.inventory` peuvent être vides.
Ils produisent des états vides adaptés.

Une propriété requise manquante produit une erreur de validation :
elle n’est pas remplacée silencieusement par un tableau vide.

Les calculs de jauges prennent en compte les capacités nulles.
Les pourcentages visuels restent compris entre 0 et 100.

## Choix de présentation

- Les informations de localisation sont regroupées.
- Le statut est distingué visuellement du mode de vol.
- Le bouton « View details » est placé dans l’en-tête de la carte.
- Les blocs de ressources gardent une structure comparable, même sans
  capacité.
- Les modules et les mounts occupent des sections distinctes.
- Chaque module et chaque mount dispose de sa propre carte.
- Les descriptions et propriétés utiles sont présentées dans les cartes.
- Les dates sont affichées en UTC.
- Le trajet est présenté comme actuel uniquement lorsque le statut
  indique un transit.

Le bouton d’ouverture du détail effectue une navigation dans l’onglet
courant. L’ouverture native dans un nouvel onglet n’est pas proposée
par ce bouton.

## Tests

### `ships.spec.ts`

Tests d’intégration du parcours de liste :

- transmission du token ;
- lecture et correction des paramètres d’URL ;
- pagination et changement de taille ;
- ouverture du détail ;
- flotte vide et page hors limites ;
- réponse invalide ;
- conservation des données après échec d’actualisation ;
- absence de données de l’ancien agent après déconnexion et reconnexion.

### `ship-detail.spec.ts`

Tests d’intégration de la fiche :

- chargement du vaisseau demandé ;
- affichage des ressources et équipements ;
- cargaison vide ou remplie ;
- sonde sans capacités ;
- informations facultatives absentes ;
- réponse 404 ;
- réponse incomplète ou contenant un autre vaisseau ;
- relance après une erreur initiale ;
- échec d’actualisation ;
- changement de vaisseau depuis la route.

### `fleet-states.spec.ts`

Tests des comportements complémentaires :

- rejet du token sur la liste et le détail ;
- attente hors ligne et reprise ;
- actualisation suspendue puis reprise ;
- limitation de requêtes ;
- informations de transit ;
- avertissements sur le carburant et l’équipage ;
- conservation temporaire de la page précédente.

### Tests des utilitaires

Les fichiers `ship-formatters.spec.ts` et `ship-status.spec.ts`
vérifient le formatage et la présentation des statuts.

Les tests d’intégration utilisent MSW pour simuler les réponses HTTP.
Ils ne dépendent pas d’un compte SpaceTraders réel.

## Limites et validation restante

- Aucune action de modification des vaisseaux.
- Aucun compte à rebours local du cooldown.
- Aucune conservation de la pagination via le lien « Back to fleet ».
- Aucune vérification visuelle automatique des espacements ou débordements.

La recette finale dans un navigateur doit encore vérifier les différentes
largeurs d’écran, les textes longs, la navigation clavier et les états
visuels.

La réussite des tests automatisés ne constitue pas une validation visuelle.
