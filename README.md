# Space Control — SpaceTraders SaaS

Interface SaaS de consultation et d’exploration d’un agent SpaceTraders, réalisée dans le cadre du test technique **Frontend Vue 3 / TypeScript d’Evertrust**.

Le projet privilégie des parcours fonctionnels complets, testés et documentés plutôt qu’une implémentation partielle de toute l’API SpaceTraders.

Le parcours principal est :

```text
Connexion
→ Agent
→ Fleet / Systems
→ Ship / Waypoint
→ Market
```

Les fonctionnalités implémentées couvrent l’authentification, l’agent, la flotte, l’exploration des systèmes et waypoints ainsi que la consultation des marchés.

---

## Fonctionnalités

| Fonctionnalité       | Périmètre réalisé                                                                     |
| -------------------- | ------------------------------------------------------------------------------------- |
| Authentification     | Vérification du token, persistance locale, restauration de session et déconnexion     |
| Agent                | Consultation des informations de l’agent connecté et navigation vers ses ressources   |
| Flotte               | Liste paginée, localisation, statut, carburant, cargaison et accès au détail          |
| Détail d’un vaisseau | Navigation, ressources, équipage, cargaison, équipements, modules, mounts et cooldown |
| Systems              | Liste paginée, informations générales et navigation vers un système                   |
| Waypoints            | Liste paginée, filtre Marketplace, traits, orbitals, modifiers, chart et détail       |
| Markets              | Ressources, prix disponibles et transactions récentes                                 |
| Navigation croisée   | Liens entre Agent, Fleet, Systems, Waypoints et Markets                               |
| Gestion des états    | Chargement, erreur, retry, état vide, actualisation, 404 et attente de connexion      |
| Qualité              | Validation Zod, tests Vitest/MSW, E2E Playwright, lint, formatage et build            |

Le périmètre est principalement **consultatif**.

Les actions de modification des vaisseaux, l’achat ou la vente de marchandises, la planification commerciale et les notifications temps réel ne sont pas implémentés.

Ce choix permet de privilégier la robustesse des parcours réellement livrés, conformément à l’objectif du test technique : produire une application bien structurée, maintenable, testée et documentée plutôt que multiplier les fonctionnalités incomplètes.

---

## Prérequis

- Node.js 24.14.0
- pnpm 12.4.1
- Un token d’agent SpaceTraders

Le gestionnaire de paquets est déclaré dans `package.json`.

Le fichier `pnpm-lock.yaml` doit être conservé et versionné.

---

## Démarrage local

Depuis la racine du dépôt :

```bash
pnpm install --frozen-lockfile

pnpm dev
```

Ouvrir ensuite l’adresse affichée par Vite.

Aucune variable d’environnement contenant un token n’est nécessaire : le token est saisi directement dans la page de connexion.

Pour vérifier localement la version de production :

```bash
pnpm build

pnpm preview
```

`pnpm preview` sert à exécuter localement le build généré.

---

## Obtenir et utiliser un token

1. Ouvrir https://my.spacetraders.io/login.
2. Récupérer le token de l’agent à utiliser.
3. Coller ce token dans la page de connexion de l’application.
4. Saisir uniquement le token, sans le préfixe `Bearer`.

L’application attend un **token d’agent** et non un token de compte.

À la connexion :

```text
GET /my/agent
```

vérifie l’accès et retourne les informations de l’agent.

Un token rejeté n’est pas enregistré.

Le token est conservé dans `localStorage` afin de restaurer la session lors d’un retour dans l’application.

La déconnexion supprime le token et nettoie les caches de données serveur.

Aucun token réel ne doit être ajouté aux fichiers du dépôt, aux fixtures, aux logs ou aux captures publiées.

---

## Stack

### Application

- Vue 3
- Composition API
- TypeScript
- Vue Router

### État et données

- Pinia
- TanStack Vue Query
- Axios
- Zod

### Interface

- Tailwind CSS
- shadcn-vue
- TanStack Table

### Tests

- Vitest
- Vue Test Utils
- MSW
- Playwright

### Qualité et CI

- Oxlint
- ESLint
- Prettier
- vue-tsc
- Vite
- GitHub Actions

Les versions et contraintes sont déclarées dans `package.json`.

Les versions résolues sont enregistrées dans `pnpm-lock.yaml`.

---

## Organisation du code

Le projet est organisé par **modules fonctionnels**.

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

| Emplacement              | Responsabilité                          |
| ------------------------ | --------------------------------------- |
| `src/app/router/`        | Routes et garde d’accès                 |
| `src/app/layouts/`       | Structure générale de l’application     |
| `src/app/providers/`     | Configuration de TanStack Query         |
| `src/config/`            | Configuration applicative               |
| `src/modules/auth/`      | Token, connexion et déconnexion         |
| `src/modules/agent/`     | API, validation et affichage de l’agent |
| `src/modules/fleet/`     | Liste et détail des vaisseaux           |
| `src/modules/systems/`   | Systèmes, waypoints et exploration      |
| `src/modules/markets/`   | Consultation des marchés                |
| `src/shared/api/`        | Client HTTP et erreurs communes         |
| `src/shared/components/` | Composants réellement partagés          |
| `src/shared/schemas/`    | Contrats utilisés par plusieurs modules |
| `src/shared/styles/`     | Styles globaux et tokens visuels        |
| `src/shared/utils/`      | Fonctions génériques partagées          |

Dans un module :

- `api/` effectue les appels HTTP et valide les réponses ;
- `schemas/` décrit les contrats Zod et les types qui en sont déduits ;
- `composables/` configure les queries et mutations ;
- `pages/` gère les paramètres de route, les états et la composition des écrans ;
- `components/` contient les sections propres au module ;
- `utils/` contient les fonctions pures spécifiques à la fonctionnalité ;
- `tests/` vérifie les comportements du module.

Les dossiers et abstractions sont ajoutés lorsqu’un besoin réel apparaît.

Le projet ne rajoute pas de couches `domain`, `repository` ou `infrastructure` lorsqu’elles ne fournissent pas de comportement supplémentaire dans ce contexte.

---

## Principes d’architecture

Plusieurs principes ont guidé l’implémentation :

### Server state séparé de l’état local

Les données provenant de SpaceTraders sont considérées comme du **server state** et sont gérées avec TanStack Query.

Elles ne sont pas recopiées dans Pinia.

### Validation à la frontière

Les réponses externes sont validées avec Zod dans la couche API avant d’être utilisées par l’application.

### Types dérivés des schémas

Lorsque cela est possible :

```ts
type Resource = z.infer<typeof resourceSchema>
```

évite de maintenir séparément un schéma runtime et une interface TypeScript équivalente.

### Fonctions API indépendantes de Pinia

Les fonctions API reçoivent explicitement le token.

Elles ne lisent pas directement le store.

### Pages comme orchestrateurs

Les pages gèrent principalement :

- les paramètres de route ;
- les queries ;
- les états ;
- la composition des sections.

La logique de présentation et les règles réutilisables sont déplacées dans des composants ou fonctions dédiées.

### Abstractions uniquement lorsqu’elles deviennent utiles

Une abstraction partagée est introduite lorsqu’un véritable second usage apparaît.

C’est notamment le cas pour :

```text
shared/utils/formatters.ts
shared/schemas/trade-symbol.schema.ts
```

Cette approche suit KISS et YAGNI et évite l’architecture spéculative.

---

## Répartition de l’état

### Pinia

Le store d’authentification expose uniquement :

- `token` ;
- `hasToken` ;
- `setToken()` ;
- `clearToken()`.

La présence du token permet l’accès aux routes protégées.

Sa validité réelle reste vérifiée par SpaceTraders.

Pinia ne contient pas les informations de l’agent, les vaisseaux, les systèmes ou les marchés.

---

### TanStack Query

TanStack Query gère les données serveur :

- agent courant ;
- liste des vaisseaux ;
- détail d’un vaisseau ;
- liste des systèmes ;
- détail d’un système ;
- liste des waypoints ;
- détail d’un waypoint ;
- marché ;
- chargements ;
- actualisations ;
- erreurs ;
- cache.

Les principales clés sont orientées ressources.

```ts
;['agent', 'current'][('ships', 'list', { page, limit })][('ships', 'detail', symbol)][
  ('systems', 'list', { page, limit })
][('systems', 'detail', systemSymbol)][('waypoints', 'list', systemSymbol, params)][
  ('waypoints', 'detail', systemSymbol, waypointSymbol)
][('markets', 'detail', systemSymbol, waypointSymbol)]
```

Le token n’est pas ajouté aux query keys.

Le cache représente uniquement la session active et est nettoyé lors des transitions d’authentification appropriées.

---

### État local et URL

Les champs de formulaire restent dans les composants concernés.

La pagination est représentée dans l’URL lorsque son état doit survivre à la navigation ou être partageable.

Exemples :

```text
/fleet?page=2&limit=10

/systems?page=2&limit=20

/systems/X1-TEST?page=2&limit=10&marketplace=true
```

Le filtre Waypoint actuellement exposé reste volontairement simple :

```text
marketplace=true
```

La couche API le traduit vers :

```text
traits=MARKETPLACE
```

---

## Connexion et cache

La connexion utilise `useMutation`.

Le parcours est :

1. validation locale du token ;
2. suppression des espaces aux extrémités ;
3. vérification qu’il n’est pas vide ;
4. appel de `getAgent(token)` ;
5. persistance du token seulement après réussite ;
6. nettoyage du QueryCache précédent ;
7. mise en cache de l’agent obtenu ;
8. navigation vers l’overview.

L’agent obtenu pendant la connexion est réutilisé sur l’écran suivant sans second appel immédiat tant que la donnée reste fraîche.

Un nouveau token invalide ne supprime pas au préalable une éventuelle session valide existante.

Lors de la déconnexion :

```text
token
→ supprimé

QueryCache
→ nettoyé
```

Un rejet d’authentification pendant une query déclenche également la sortie de session prévue par l’application.

---

## Appels API et validation

Les fonctions API reçoivent explicitement le token.

Exemples :

```ts
getAgent(token)

getShips(token, params)
getShip(token, symbol)

getSystems(token, params)
getSystem(token, systemSymbol)

getWaypoints(token, systemSymbol, params)

getWaypoint(token, systemSymbol, waypointSymbol)

getMarket(token, systemSymbol, waypointSymbol)
```

Elles restent indépendantes du store Pinia.

Les réponses réseau sont validées avec Zod avant d’être exposées aux composants.

Une réponse invalide produit une erreur dédiée.

Elle n’est jamais silencieusement transformée en :

```text
[]
0
"Unknown"
{}
```

lorsque ces valeurs n’appartiennent pas réellement au contrat.

Certaines fonctions vérifient également la cohérence de la ressource retournée avec la requête.

Par exemple :

```text
Ship.symbol
→ doit correspondre au ship demandé

System.symbol
→ doit correspondre au system demandé

Waypoint.systemSymbol
→ doit correspondre au système demandé

Waypoint.symbol
→ doit correspondre au waypoint demandé

Market.symbol
→ doit correspondre au waypoint demandé
```

Le client HTTP centralise notamment :

- authentification Bearer ;
- erreurs réseau ;
- délais dépassés ;
- réponses d’authentification ;
- limitation de requêtes ;
- erreurs serveur.

Les queries transmettent le `AbortSignal` fourni par TanStack Query au client HTTP.

Le login ne crée pas d’`AbortController` manuel.

---

## Agent Overview

L’overview présente les informations principales de l’agent :

- symbole ;
- faction ;
- crédits ;
- nombre de vaisseaux ;
- headquarters.

L’écran sert également de point de navigation.

Le nombre de vaisseaux permet d’ouvrir Fleet.

Le headquarters peut ouvrir directement son waypoint lorsque son système parent peut être dérivé du symbole retourné par SpaceTraders.

---

## Fleet

La page Fleet fournit une liste paginée des vaisseaux de l’agent.

Chaque carte présente notamment :

- identité ;
- rôle ;
- frame ;
- statut ;
- mode de vol ;
- système ;
- waypoint ;
- destination lorsqu’un trajet est actif ;
- carburant ;
- cargaison.

Les systèmes et waypoints affichés sont navigables vers le module Systems.

La fiche d’un vaisseau détaille :

- navigation ;
- ressources ;
- équipage ;
- cargaison ;
- cooldown ;
- frame ;
- reactor ;
- engine ;
- modules ;
- mounts.

Les valeurs nulles ou les capacités à zéro sont considérées comme des états métier valides lorsqu’elles respectent le contrat.

---

## Systems et Waypoints

La page Systems affiche une liste paginée des systèmes connus.

Chaque système expose notamment :

- symbole ;
- nom lorsqu’il est fourni ;
- type ;
- secteur ;
- constellation lorsqu’elle existe ;
- coordonnées ;
- nombre de waypoints ;
- factions.

Le détail d’un système charge séparément :

```text
System
+
Waypoints
```

Une erreur de chargement des waypoints ne masque donc pas les informations déjà disponibles pour le système.

Les waypoints affichent notamment :

- symbole ;
- type ;
- coordonnées ;
- faction ;
- orbitals ;
- traits ;
- état de construction.

Le détail d’un waypoint présente également les informations optionnelles telles que :

- modifiers ;
- chart ;
- parent orbit ;
- orbitals.

Les relations disponibles sont navigables.

---

### Waypoints `UNCHARTED`

Un waypoint `UNCHARTED` peut masquer ses véritables traits.

Dans cette situation, l’absence de :

```text
MARKETPLACE
```

ne permet pas de conclure que le waypoint ne possède pas de marché.

L’interface affiche donc :

```text
Marketplace
Unknown
```

au lieu d’inventer une absence définitive.

La règle est centralisée dans une fonction pure et non directement dans les composants.

---

### Filtre Marketplace

Un filtre simple :

```text
Marketplace only
```

est disponible sur la liste des waypoints.

Le frontend conserve :

```text
marketplace=true
```

dans son URL.

La couche API transforme ensuite ce besoin en :

```text
traits=MARKETPLACE
```

Le filtre permet de retrouver directement les waypoints utiles au parcours :

```text
System
→ Waypoint commercial
→ Market
```

---

## Markets

Un waypoint dont le trait `MARKETPLACE` est connu peut ouvrir :

```text
/systems/:systemSymbol/waypoints/:waypointSymbol/market
```

Le module Market reste séparé de Systems même si l’endpoint SpaceTraders est imbriqué sous `/systems`.

La séparation correspond à une responsabilité fonctionnelle :

```text
Systems
→ exploration et géographie

Markets
→ données commerciales
```

Le marché expose trois ressources structurelles :

- exports ;
- imports ;
- exchange.

Il peut également fournir :

- `tradeGoods` ;
- `transactions`.

Ces deux dernières propriétés sont optionnelles.

L’interface distingue explicitement :

```text
champ absent
→ information détaillée indisponible

champ présent avec []
→ information disponible mais vide

champ présent avec des éléments
→ affichage des données
```

L’absence de prix ne devient donc jamais automatiquement :

```text
prix = 0
marché vide
erreur de validation
```

---

### TanStack Table

Les prix détaillés et transactions utilisent `@tanstack/vue-table`.

L’intégration reste volontairement limitée au besoin actuel :

- colonnes typées ;
- headers ;
- rows ;
- `FlexRender`.

Aucune fonctionnalité supplémentaire n’est activée sans besoin produit :

- pas de pagination locale ;
- pas de tri ;
- pas de filtre local ;
- pas de sélection ;
- pas de virtualisation.

---

## Navigation croisée

L’application utilise les relations déjà présentes dans les ressources SpaceTraders afin de rendre les différents modules réellement navigables entre eux.

Exemples :

```text
Agent
→ Headquarters

Agent
→ Fleet

Ship
→ System
→ Waypoint

Ship navigation
→ Origin
→ Destination

System
→ Waypoint

Waypoint
→ Parent System
→ Parent Waypoint
→ Orbitals

Waypoint Marketplace
→ Market

Market
→ Waypoint
→ System
```

Les liens sont créés uniquement lorsqu’une relation fiable est disponible.

Par exemple, le symbole d’un vaisseau présent dans une transaction Market n’est pas automatiquement transformé en lien Fleet, car rien ne garantit que ce vaisseau appartient à l’agent courant.

---

## Interface

Les styles communs utilisent Tailwind CSS, les tokens visuels du projet et les primitives shadcn-vue.

`AppButton` centralise notamment :

- variantes ;
- états disabled ;
- chargement.

`FeedbackState` fournit une présentation cohérente pour :

- loading ;
- error ;
- empty state.

Les composants fonctionnels reçoivent directement les données typées dont ils ont besoin.

Aucun modèle générique de présentation n’est créé uniquement pour homogénéiser artificiellement plusieurs ressources différentes.

---

### Formatters partagés

Les besoins génériques de présentation utilisés dans plusieurs modules sont centralisés dans :

```text
src/shared/utils/formatters.ts
```

On y trouve notamment :

- formatage des nombres ;
- formatage des dates ;
- transformation de valeurs enum en libellés.

Les calculs véritablement spécifiques aux vaisseaux restent dans :

```text
src/modules/fleet/utils/ship-formatters.ts
```

Cette séparation évite que les composants contiennent des helpers génériques dupliqués.

---

### TradeSymbol partagé

`TradeSymbol` est utilisé dans plusieurs contrats, notamment Fleet et Markets.

Le schéma commun est défini dans :

```text
src/shared/schemas/trade-symbol.schema.ts
```

Cette extraction n’a été introduite qu’après l’apparition d’un réel besoin partagé.

---

## Vérifications

La commande principale est :

```bash
pnpm check
```

Elle exécute les contrôles de qualité configurés par le projet :

1. Oxlint et ESLint ;
2. vérification Prettier ;
3. tests Vitest ;
4. vérification TypeScript ;
5. build de production.

Commandes utiles :

```bash
pnpm test:unit

pnpm test:unit:run

pnpm type-check

pnpm lint

pnpm format

pnpm build
```

Pour les parcours E2E :

```bash
pnpm test:e2e
```

Il est également possible d’exécuter un scénario isolé :

```bash
pnpm exec playwright test e2e/systems-market.spec.ts
```

---

## Stratégie de tests

Le projet utilise plusieurs niveaux de vérification.

### Tests unitaires

Ils couvrent les fonctions pures ayant une logique utile :

```text
formatters
ship status
ship calculations
waypoint marketplace status
space symbol parsing
```

### Tests d’intégration Vue

Ils montent les pages avec :

- Vue Router ;
- Pinia ;
- TanStack Query ;
- MSW.

Ils testent les comportements principaux :

- chargement ;
- pagination ;
- navigation ;
- états vides ;
- erreurs ;
- retry ;
- rafraîchissement ;
- réponses invalides ;
- changements de session.

Les requêtes SpaceTraders sont simulées avec MSW.

Ces tests ne nécessitent donc ni token réel ni disponibilité de l’API externe.

---

### Tests E2E

Playwright est réservé aux parcours utilisateurs critiques.

Les scénarios principaux sont :

```text
Agent
→ Fleet
→ Ship
```

et :

```text
Connexion
→ Systems
→ System
→ Waypoint
→ Market
→ retours vers les écrans parents
```

L’objectif n’est pas de recopier toute la suite Vitest dans Playwright.

Les cas métier détaillés et les erreurs restent majoritairement vérifiés au niveau intégration.

---

## Intégration continue

Le workflow :

```text
.github/workflows/ci.yml
```

est déclenché selon la configuration du dépôt, notamment sur les changements destinés à être intégrés.

Il prépare l’environnement Node.js et pnpm, restaure ou installe les dépendances avec le lockfile puis exécute les contrôles automatisés configurés pour le projet.

Les contrôles locaux doivent rester exécutables avec :

```bash
pnpm check
```

et les parcours navigateur avec :

```bash
pnpm test:e2e
```

L’application n’est pas automatiquement considérée comme valide uniquement parce que la CI est verte : une recette visuelle reste nécessaire.

---

## Documentation complémentaire

La documentation détaillée est séparée par fonctionnalité.

- [Architecture](docs/architecture.md)
- [Authentification](docs/features/auth.md)
- [Fleet](docs/features/fleet.md)
- [Systems et Waypoints](docs/features/systems.md)
- [Markets](docs/features/markets.md)
- [Documentation SpaceTraders](https://spacetraders.io/openapi)

Les documents de fonctionnalités décrivent notamment :

- périmètre ;
- responsabilités ;
- appels réseau ;
- cache ;
- états d’interface ;
- tests ;
- limites ;
- décisions spécifiques au module.

---

## Choix de périmètre et améliorations possibles

L’API SpaceTraders propose une surface fonctionnelle beaucoup plus large que celle implémentée ici.

Le choix a été de privilégier plusieurs parcours complets, testés et documentés plutôt qu’un grand nombre de fonctionnalités partiellement terminées.

Certaines fonctionnalités ont donc été volontairement reportées.

---

### Authentification

Le token SpaceTraders est conservé dans `localStorage`.

Dans le contexte d’un test frontend directement connecté à une API externe, ce compromis permet de restaurer simplement la session.

Dans une application de production contrôlant également son backend, une stratégie différente pourrait être préférable afin de réduire l’exposition des credentials côté navigateur.

L’application ne synchronise pas non plus automatiquement l’état d’authentification et les caches entre plusieurs onglets déjà ouverts.

Une connexion réseau déjà démarrée n’est pas explicitement annulée simplement parce que l’utilisateur quitte la page de login.

---

### Agent

L’overview reste volontairement synthétique.

Il sert principalement de point d’entrée vers :

- les informations générales de l’agent ;
- Fleet ;
- le headquarters.

Aucun historique de crédits ni statistiques commerciales artificielles ne sont calculés à partir de données insuffisantes.

---

### Fleet

Fleet est consultatif.

Les actions SpaceTraders suivantes ne sont pas implémentées :

```text
dock
orbit
navigate
refuel
extract
survey
jettison
```

Ces opérations introduiraient de nouveaux workflows métier, des mutations et plusieurs invalidations de cache.

Le cooldown affiché correspond à la dernière réponse serveur.

Aucun timer local permanent n’est maintenu pour décrémenter la valeur côté navigateur.

Le lien `Back to fleet` revient vers la route canonique :

```text
/fleet
```

et ne restaure pas automatiquement la pagination précédemment sélectionnée.

Le bouton précédent du navigateur conserve naturellement l’historique réel de navigation.

---

### Systems et Waypoints

Les listes utilisent la pagination serveur.

L’interface ne simule pas de recherche globale en filtrant uniquement les éléments de la page actuellement chargée.

#### Filtres Waypoints

SpaceTraders expose davantage de possibilités de filtrage que l’interface actuelle.

Il serait notamment possible de filtrer par :

```text
type

traits
```

et de combiner plusieurs traits.

Seul le besoin :

```text
Marketplace only
```

a été conservé.

Ce choix est volontaire.

Une implémentation complète aurait nécessité :

- un modèle de filtres frontend ;
- un contrat d’URL propre à l’application ;
- la conversion vers les query params SpaceTraders ;
- la gestion des types ;
- plusieurs traits simultanés ;
- leur normalisation ;
- l’adaptation des query keys ;
- une politique claire de placeholder pendant les changements de filtres ;
- une interface permettant d’exposer un grand nombre de traits sans surcharger l’écran.

Une implémentation partielle aurait créé plus de complexité et de couplage que de valeur pour le parcours demandé.

La version actuelle privilégie donc :

```text
System
→ Marketplace Waypoint
→ Market
```

Une évolution future pourrait introduire un modèle de filtres applicatif explicite et un adaptateur dédié vers le contrat SpaceTraders.

L’URL frontend ne devrait pas simplement recopier les paramètres techniques de l’API externe.

---

#### Carte spatiale

Aucune représentation graphique des systèmes et waypoints n’est implémentée.

Les coordonnées disponibles permettraient pourtant :

- une carte 2D ;
- une représentation des orbitals ;
- une visualisation des vaisseaux ;
- une navigation spatiale.

Cette fonctionnalité aurait demandé un investissement UI important sans améliorer suffisamment le parcours principal du test.

---

#### Contexte de navigation

Le lien `Back to system` revient actuellement vers la route canonique du système.

Il ne restaure pas explicitement la pagination ou le filtre Marketplace précédemment sélectionnés.

Le bouton précédent du navigateur conserve naturellement cet historique.

Une future version pourrait transporter un contexte de retour ou restaurer certains paramètres de route de manière contrôlée.

---

### Markets

Markets est volontairement **read-only**.

Les ressources, prix disponibles et transactions sont consultables.

Aucun bouton d’achat ou de vente n’est proposé.

Un véritable workflow de trading nécessiterait de coordonner :

```text
Market

Ship

Cargo

Agent credits

Quantity

Business validation

Mutation states

Cache invalidation

Error handling
```

Après une transaction, plusieurs ressources pourraient devoir être mises à jour :

```text
Market
Ship
Agent
```

Ajouter uniquement deux boutons `Buy` et `Sell` sans traiter ces responsabilités aurait donné une fonctionnalité artificiellement incomplète.

---

#### TanStack Table

Les tables Market utilisent TanStack Table uniquement pour leur besoin actuel.

Les fonctionnalités suivantes ne sont pas encore activées :

- sorting ;
- filtering local ;
- column visibility ;
- row selection ;
- pagination locale ;
- virtualisation.

Elles pourront être ajoutées si le volume ou les besoins UX le justifient.

---

#### Historique de prix

L’application ne persiste pas les observations successives des marchés.

Elle ne peut donc pas afficher :

- historique ;
- tendances ;
- volatilité ;
- évolution des prix.

Cette fonctionnalité nécessiterait une source historique ou une couche de stockage supplémentaire.

---

#### Comparaison de marchés

Aucune comparaison automatique multi-market n’est proposée.

Une telle fonctionnalité pourrait intégrer :

- prix d’un même produit sur plusieurs markets ;
- distance ;
- fuel nécessaire ;
- cargo disponible ;
- coût d’achat ;
- prix de revente ;
- marge potentielle.

Elle correspondrait progressivement à une véritable fonctionnalité de planification commerciale.

---

### Actualisation et temps réel

Il n’y a pas de polling généralisé ni de connexion temps réel.

L’utilisateur peut actualiser manuellement les écrans.

TanStack Query gère également les comportements liés à l’état du réseau et à la reconnexion configurés dans l’application.

Une stratégie plus agressive devrait être ajoutée uniquement lorsque la fraîcheur des données apporte une réelle valeur métier.

---

### Validation des contrats

Les réponses externes importantes sont validées avec Zod.

Les types TypeScript sont déduits des schémas lorsque cela est possible.

Une évolution envisageable serait de générer une partie des types depuis l’OpenAPI SpaceTraders.

Le choix actuel conserve cependant plusieurs avantages :

- validation runtime explicite ;
- contrats proches des fonctionnalités réellement utilisées ;
- contrôle précis sur les propriétés obligatoires et facultatives ;
- erreurs applicatives compréhensibles.

---

### Abstractions

Le projet évite volontairement certaines abstractions génériques.

Il n’existe par exemple pas de :

```text
Repository layer

Generic domain layer

Generic AppTable

Presentation DTO pour chaque ressource
```

Les abstractions communes sont introduites uniquement lorsque plusieurs usages réels apparaissent.

Exemples :

```text
shared formatters

TradeSymbol partagé

FeedbackState

AppButton
```

Cette approche vise à éviter l’architecture spéculative et suit KISS et YAGNI.

---

### Accessibilité et validation visuelle

Les composants utilisent autant que possible :

- HTML sémantique ;
- labels accessibles ;
- rôles ;
- messages d’état ;
- focus visible ;
- navigation clavier.

Les tests automatisés ne permettent cependant pas de garantir tous les détails visuels.

La recette finale doit notamment vérifier :

- mobile ;
- tablette ;
- desktop ;
- textes longs ;
- débordements ;
- tableaux Market ;
- scroll horizontal ;
- focus clavier ;
- états loading/error/empty ;
- routes profondes après rechargement.

---

## Ce que je prioriserais ensuite

Avec davantage de temps, les évolutions que je prioriserais seraient :

1. Finaliser la recette responsive et accessibilité sur tous les écrans.
2. Ajouter des filtres Waypoints plus complets avec un modèle frontend découplé de l’API.
3. Préserver davantage le contexte de navigation lors des retours depuis les pages détail.
4. Ajouter tri et recherche aux tables Market lorsque le besoin le justifie.
5. Implémenter un workflow complet d’achat et de vente.
6. Ajouter les actions Fleet principales avec gestion correcte des mutations.
7. Ajouter une représentation spatiale des Systems et Waypoints.
8. Introduire une stratégie d’actualisation adaptée aux données réellement dynamiques.
9. Ajouter davantage de tests d’accessibilité automatisés.
10. Évaluer une génération partielle des contrats depuis l’OpenAPI.
11. Ajouter éventuellement un historique des marchés et des prix.
12. Construire une fonctionnalité de comparaison et planification commerciale.

Ces éléments sont volontairement considérés comme des **évolutions possibles** et non comme des fonctionnalités incomplètes de la livraison actuelle.

La priorité de cette version reste la cohérence du code, la fiabilité des contrats, la qualité des états d’interface, les tests et la maintenabilité des parcours effectivement implémentés.
