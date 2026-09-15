# Space Control — SpaceTraders SaaS

Interface de consultation des opérations d’un agent SpaceTraders, réalisée
dans le cadre du test technique Frontend Vue 3 / TypeScript d’Evertrust.

Le périmètre privilégie un parcours complet : connexion avec un token
d’agent, consultation de l’agent, liste paginée des vaisseaux et fiche
détaillée de chaque vaisseau.

## Fonctionnalités

| Fonctionnalité       | Périmètre réalisé                                                                     |
| -------------------- | ------------------------------------------------------------------------------------- |
| Authentification     | Vérification du token, persistance locale et déconnexion                              |
| Agent                | Consultation des informations de l’agent connecté                                     |
| Flotte               | Liste paginée, localisation, statut, carburant et capacité de stockage                |
| Détail d’un vaisseau | Navigation, ressources, équipage, cargaison, équipements, modules, mounts et cooldown |
| Gestion des états    | Chargement, erreur, relance, liste vide, actualisation et attente de connexion        |

L’exploration des systèmes, les marchés et les actions sur les vaisseaux
ne font pas partie du périmètre actuellement réalisé.

Ce choix permet de travailler la structure, les états d’interface et les
tests des parcours existants avant d’ajouter d’autres fonctionnalités.

## Prérequis

- Node.js 24.14.0
- pnpm 12.4.1
- Un token d’agent SpaceTraders

Le gestionnaire de paquets est déclaré dans `package.json`.
Le fichier `pnpm-lock.yaml` doit être conservé et versionné.

## Démarrage local

Depuis la racine du dépôt :

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Ouvrir l’adresse affichée par Vite.

Aucune variable d’environnement contenant un token n’est nécessaire :
le token est saisi dans la page de connexion.

Pour vérifier la version de production :

```bash
pnpm build
pnpm preview
```

`pnpm preview` sert à vérifier localement le résultat du build.

## Obtenir et utiliser un token

1. Ouvrir https://my.spacetraders.io/login.
2. Récupérer le token de l’agent à utiliser.
3. Coller ce token dans la page de connexion de l’application.
4. Saisir uniquement le token, sans le préfixe `Bearer`.

L’application attend un **token d’agent**, et non un token de compte.

À la connexion, `GET /my/agent` vérifie l’accès et retourne les informations
de l’agent. Un token rejeté n’est pas enregistré.

Le token est conservé dans `localStorage` afin de permettre de revenir
dans l’application après fermeture du navigateur. La déconnexion supprime
ce token et nettoie les caches en mémoire.

Ne pas ajouter de token réel aux fichiers du dépôt, aux fixtures ou aux
captures publiées.

## Stack

- Vue 3 et Composition API
- TypeScript
- Vue Router
- Pinia
- TanStack Vue Query
- Axios
- Zod
- Tailwind CSS et composants shadcn-vue
- Vitest, Vue Test Utils et MSW
- ESLint, Oxlint et Prettier
- GitHub Actions

Les versions et contraintes sont déclarées dans `package.json`.
Les versions résolues sont enregistrées dans `pnpm-lock.yaml`.

## Organisation du code

Le projet est organisé par modules fonctionnels.

| Emplacement              | Responsabilité                                  |
| ------------------------ | ----------------------------------------------- |
| `src/app/router/`        | Routes et garde d’accès                         |
| `src/app/layouts/`       | Structure générale de l’application             |
| `src/app/providers/`     | Configuration de TanStack Query                 |
| `src/modules/auth/`      | Token, connexion et déconnexion                 |
| `src/modules/agent/`     | API, validation et affichage de l’agent         |
| `src/modules/fleet/`     | Liste et détail des vaisseaux                   |
| `src/shared/api/`        | Client HTTP et erreurs communes                 |
| `src/shared/components/` | Composants réutilisés entre les fonctionnalités |
| `src/shared/styles/`     | Styles globaux et tokens visuels                |
| `src/shared/utils/`      | Utilitaires partagés                            |

Dans un module :

- `api/` effectue les appels HTTP et valide les réponses ;
- `schemas/` décrit les contrats Zod et les types qui en sont déduits ;
- `composables/` configure les queries et mutations ;
- `pages/` compose les écrans et leurs états ;
- `components/` contient les sections propres au module ;
- `utils/` regroupe les fonctions de présentation réutilisées ;
- `tests/` vérifie les comportements du module.

Les dossiers sont ajoutés lorsqu’ils ont une utilité concrète.

Cette organisation permet de garder les éléments d’une fonctionnalité
proches les uns des autres, sans ajouter des couches de domaine et
d’infrastructure qui n’apporteraient pas de comportement supplémentaire
dans ce périmètre.

## Répartition de l’état

### Pinia

Le store d’authentification expose uniquement :

- `token` ;
- `hasToken` ;
- `setToken()` ;
- `clearToken()`.

La présence d’un token permet l’accès aux routes protégées.
Sa validité reste vérifiée par l’API.

### TanStack Query

TanStack Query gère les données serveur et leurs états :

- données de l’agent ;
- listes et détails des vaisseaux ;
- chargement et actualisation ;
- erreurs ;
- cache ;
- mutation de connexion.

L’agent et les vaisseaux ne sont pas recopiés dans Pinia.

### État local et URL

Les champs de formulaire restent dans les composants concernés.
La pagination de la flotte est représentée dans l’URL avec `page` et
`limit`.

## Connexion et cache

La connexion utilise `useMutation` :

1. validation locale du champ : suppression des espaces aux extrémités
   et vérification qu’il n’est pas vide ;
2. appel de `getAgent(token)` ;
3. enregistrement du token après réussite ;
4. suppression de toutes les queries précédentes ;
5. mise en cache de l’agent retourné ;
6. navigation vers la vue d’ensemble.

L’agent obtenu pendant la connexion est réutilisé sur l’écran suivant,
sans second appel immédiat tant que cette donnée est fraîche.

Les clés sont fondées sur les ressources :

```ts
;['agent', 'current'][('ships', 'list', { page, limit })][('ships', 'detail', symbol)]
```

Le cache représente l’agent courant. Il n’utilise ni token secret ni
identifiant local de session dans ses clés.

Le changement d’agent passe par une déconnexion puis une connexion.
Modifier directement le token du store ne constitue pas un parcours
de changement d’agent.

À la déconnexion ou lorsqu’une query rencontre un rejet
d’authentification, le token est supprimé et les caches de TanStack Query
sont nettoyés.

## Appels API et validation

Les fonctions API reçoivent explicitement le token :

```ts
getAgent(token)
getShips(token, params)
getShip(token, symbol)
```

Elles restent indépendantes du store Pinia.

Les réponses réseau sont validées avec Zod avant d’être utilisées par
l’interface. Les types TypeScript sont déduits des schémas pour éviter
de maintenir séparément deux descriptions du même contrat.

Une réponse invalide produit une erreur dédiée. Elle n’est pas
transformée en liste vide ou en valeurs fictives.

Le client HTTP centralise notamment :

- les erreurs d’authentification ;
- les erreurs réseau et les délais dépassés ;
- la limitation de requêtes ;
- les erreurs serveur.

Les queries transmettent le signal fourni par TanStack au client HTTP.
Le login ne crée pas d’AbortController manuel.

## Interface

Les styles communs utilisent des tokens de couleur et les primitives
shadcn-vue.

`AppButton` centralise les variantes et le comportement de chargement.
`FeedbackState` fournit une présentation commune des états de chargement,
d’erreur et de liste vide.

Les composants propres à Fleet reçoivent les données typées du vaisseau
ou de la section concernée. Les informations ne sont pas transformées en
modèles génériques d’équipement uniquement pour faciliter le rendu.

## Vérifications

```bash
pnpm check
```

Cette commande exécute successivement :

1. Oxlint et ESLint ;
2. la vérification Prettier ;
3. les tests Vitest ;
4. la vérification TypeScript et le build de production.

Commandes utiles :

```bash
pnpm test:unit
pnpm test:unit:run
pnpm type-check
pnpm lint
pnpm format
pnpm build
```

Les tests de parcours montent l’application avec Vue Router, Pinia et
TanStack Query. MSW intercepte les requêtes HTTP pour simuler les réponses
de SpaceTraders.

Ces tests ne nécessitent ni token réel ni disponibilité de l’API externe.

Les fixtures représentent des réponses API valides, notamment un
vaisseau disposant de capacités et une sonde sans carburant, cargaison
ou équipage.

Les tests automatisés ne remplacent pas une vérification visuelle dans
un navigateur.

## Intégration continue

Le workflow `.github/workflows/ci.yml` est déclenché sur les pushes,
les pull requests et manuellement.

Il prépare Node.js et pnpm, installe les dépendances avec
`--frozen-lockfile`, puis exécute `pnpm check`.

Les tests Playwright ne sont pas inclus dans cette commande.

Le workflow actuel assure la qualité et la construction de l’application.
Il ne publie pas automatiquement l’application sur un hébergement.

## Limites actuelles

- Le périmètre est centré sur la consultation de l’agent et de sa flotte.
- Les ressources API ne sont pas persistées dans le navigateur.
- L’application n’offre pas de consultation complète hors ligne.
- Il n’y a ni polling régulier ni notifications en temps réel.
- Le cooldown affiché correspond à la dernière réponse API, sans compte
  à rebours local.
- Les onglets déjà ouverts ne synchronisent pas automatiquement leur
  état Pinia ni leur cache après une connexion ou une déconnexion dans
  un autre onglet.
- Une connexion en cours n’est pas annulée lorsque l’utilisateur quitte
  sa page.
- Le retour depuis une fiche vaisseau ne restaure pas la pagination
  précédente de la flotte.

## Documentation complémentaire

- [Fonctionnalité Fleet](docs/features/fleet.md)
- [Documentation SpaceTraders](https://spacetraders.io/openapi)
