# Authentification

## Objectif

Le module `auth` gère la session locale nécessaire pour appeler l’API SpaceTraders.

SpaceTraders utilise un token Bearer.

L’utilisateur fournit ce token depuis la page de connexion.

Le module Auth est volontairement limité à :

```text
token
connexion
persistance locale
déconnexion
protection des routes
```

Les informations de l’agent ne sont pas stockées dans Auth.

Elles appartiennent au module `agent` et restent dans TanStack Query.

---

## Flux de connexion

Le parcours de connexion est :

```text
Token saisi
↓
validation locale
↓
GET /my/agent
↓
token accepté ?
↓
oui
↓
nettoyage du QueryCache précédent
↓
persistance du token
↓
mise en cache de l’agent
↓
navigation vers l’overview
```

Le token n’est enregistré qu’après validation par SpaceTraders.

---

## Store Pinia

Le store Auth reste volontairement minimal.

Il expose :

```ts
token

hasToken

setToken()

clearToken()
```

Il ne contient pas :

```text
agent
user profile
ships
systems
market
loading global
error global
```

Les données serveur ne sont pas dupliquées dans Pinia.

---

## Persistance

Le token est conservé dans :

```text
localStorage
```

Ce choix permet de restaurer la session après fermeture ou rechargement du navigateur.

Au démarrage de l’application, la présence du token permet d’accéder aux routes protégées.

La validité du token reste cependant vérifiée lors des appels SpaceTraders.

La présence locale d’une valeur n’est donc pas considérée comme une preuve définitive que la session est toujours valide.

---

## Pourquoi `localStorage` ?

Dans ce test technique, le frontend communique directement avec l’API SpaceTraders.

Il n’existe pas de backend applicatif contrôlé par le projet permettant d’utiliser par exemple une session serveur ou un cookie HttpOnly.

`localStorage` constitue donc ici un compromis simple pour restaurer la session.

Dans une application de production disposant de son propre backend, une stratégie différente pourrait être préférable selon le modèle de sécurité retenu.

---

## Validation locale

Avant l’appel réseau, le token est :

```text
trim()
```

puis vérifié comme non vide.

L’objectif est uniquement d’empêcher une requête manifestement invalide.

Le frontend ne tente pas de reproduire les règles internes de génération des tokens SpaceTraders.

La validation réelle appartient au serveur :

```text
GET /my/agent
```

---

## Vérification du token

La connexion utilise :

```ts
getAgent(candidateToken)
```

avec le token candidat passé explicitement.

La fonction API n’accède pas au store Auth.

Cela permet de vérifier un token avant de modifier la session courante.

---

## Ne pas supprimer la session avant validation

Lorsqu’un utilisateur soumet un nouveau token, l’ancienne session valide n’est pas supprimée avant de savoir si le nouveau token fonctionne.

Le flux est donc :

```text
session actuelle
+
nouveau token candidat
↓
validation réseau du candidat
↓
succès
→ remplacement de session

échec
→ session précédente non supprimée prématurément
```

Cela évite qu’une faute de saisie détruit immédiatement une session encore valide.

---

## `useMutation`

La connexion est une action déclenchée par l’utilisateur et non une donnée à lire automatiquement.

Elle utilise donc TanStack Query `useMutation`.

La mutation gère notamment :

- pending ;
- succès ;
- erreur.

Il n’est pas nécessaire de créer manuellement des flags tels que :

```text
isLoggingIn
loginError
```

dans Pinia.

---

## Succès de connexion

Après validation réussie :

1. le cache de données de la session précédente est nettoyé ;
2. le nouveau token est conservé ;
3. l’agent retourné par `getAgent()` est placé dans le cache ;
4. l’utilisateur est redirigé vers l’overview.

L’agent n’a donc pas besoin d’être immédiatement rechargé après la navigation.

La query :

```ts
;['agent', 'current']
```

dispose déjà de la réponse obtenue pendant la connexion.

---

## Nettoyage du cache

Le QueryCache est associé à la session active.

Lors d’un changement d’agent, les anciennes données doivent être supprimées.

Le nettoyage concerne donc potentiellement :

```text
agent
fleet
ship details
systems
waypoints
markets
```

Le projet ne place pas le token dans les query keys pour isoler artificiellement plusieurs sessions.

Une seule session active est représentée à la fois.

---

## Déconnexion

Le logout effectue principalement :

```text
clearToken()
+
QueryCache.clear()
+
navigation login
```

L’application ne doit pas conserver les ressources de l’agent précédent après la déconnexion.

---

## Rejet d’authentification pendant une query

Un token peut devenir invalide après une connexion réussie.

Le client HTTP et la configuration de query traitent donc les erreurs d’authentification comme une fin de session.

Lorsque le rejet correspond réellement à un problème d’authentification :

```text
token
→ supprimé

cache
→ nettoyé

application
→ retour vers login
```

Une erreur réseau ou une limitation HTTP ne doit pas provoquer le même comportement.

Par exemple :

```text
429
≠
logout
```

---

## Garde de navigation

Les routes métier nécessitent un token présent.

Sans token, un utilisateur tentant d’accéder directement à une route protégée est redirigé vers :

```text
/login
```

Exemples de routes protégées :

```text
/
 /fleet
 /fleet/:symbol
 /systems
 /systems/:systemSymbol
 /systems/:systemSymbol/waypoints/:waypointSymbol
 /systems/:systemSymbol/waypoints/:waypointSymbol/market
```

La garde vérifie la présence locale de la session.

La validité serveur est ensuite confirmée par les appels API.

---

## Route Login

Lorsqu’une session locale existe déjà, la page Login n’a pas vocation à devenir le point d’entrée normal de l’utilisateur.

Le routeur peut donc rediriger vers l’application selon la configuration prévue.

Le contrôle principal reste cependant le comportement des routes protégées.

---

## Client HTTP

Les fonctions API reçoivent toujours le token explicitement :

```ts
getAgent(token)

getShips(token, params)

getSystem(token, symbol)

getMarket(token, systemSymbol, waypointSymbol)
```

Le client HTTP ajoute ensuite :

```http
Authorization: Bearer <token>
```

La fonction API reste indépendante de Pinia.

---

## Pourquoi ne pas utiliser un interceptor lisant Pinia ?

Lire le store directement dans un interceptor Axios aurait réduit le nombre de paramètres mais créé une dépendance implicite :

```text
API function
↓
global Axios
↓
Pinia
```

Le projet préfère rendre la dépendance visible :

```ts
getShip(token, symbol)
```

Cela simplifie :

- tests unitaires ;
- tests d’intégration ;
- raisonnement sur le token utilisé ;
- vérification d’un token candidat avant login.

---

## Annulation des requêtes

Les queries utilisent le signal fourni par TanStack Query :

```ts
queryFn: ({ signal }) => getShip(token, symbol, signal)
```

Le signal est transmis jusqu’à Axios.

Le login ne crée pas de `AbortController` manuel supplémentaire.

La mutation reste suffisamment simple pour ce périmètre.

---

## Sécurité

Le projet ne doit jamais contenir de token réel dans :

- le repository ;
- les fixtures ;
- les tests ;
- les captures ;
- les fichiers `.env` versionnés ;
- les logs.

Les tests utilisent uniquement de faux tokens.

Exemple :

```text
agent-test-token
e2e-systems-market-token
```

---

## Affichage du token

Le champ de connexion utilise un champ masqué par défaut.

L’utilisateur peut contrôler temporairement sa visibilité via le bouton prévu dans l’interface.

Ce bouton possède son propre libellé accessible, distinct du champ.

Exemple :

```text
Agent token

Show agent token
```

Cette distinction est également importante pour les tests Playwright afin d’utiliser des locators accessibles et non ambigus.

---

## États de connexion

L’interface doit distinguer :

| Situation                    | Comportement                                                                |
| ---------------------------- | --------------------------------------------------------------------------- |
| Champ vide                   | Validation locale, aucune requête                                           |
| Token en cours de validation | Bouton en chargement                                                        |
| Token valide                 | Session créée et navigation                                                 |
| Token refusé                 | Erreur affichée, candidat non persisté                                      |
| Erreur réseau                | Message approprié, pas de fausse authentification                           |
| Session existante            | Données déjà chargées conservées tant qu’un nouveau token n’est pas accepté |

---

## Tests

Les tests Auth couvrent notamment :

- protection des routes ;
- token vide ;
- validation du token via `/my/agent` ;
- persistance seulement après succès ;
- rejet d’un token invalide ;
- restauration du token depuis `localStorage` ;
- déconnexion ;
- nettoyage du cache ;
- séparation entre session locale et données serveur.

Les appels réseau sont simulés avec MSW.

Aucun test n’utilise un token SpaceTraders réel.

---

## Interaction avec Agent

Auth et Agent restent séparés.

```text
Auth
→ connaît le token

Agent
→ connaît la ressource Agent
```

Lors du login, Auth appelle toutefois `getAgent()` pour vérifier le token.

La réponse est ensuite directement injectée dans le cache :

```ts
;['agent', 'current']
```

Ce comportement évite :

```text
login
→ GET /my/agent

navigation
→ GET /my/agent à nouveau immédiatement
```

---

## Interaction avec TanStack Query

La configuration globale de Query doit tenir compte du changement de session.

Le cache n’est pas persistant dans `localStorage`.

Après rechargement :

```text
token
→ restauré

server data
→ rechargées lorsque nécessaires
```

Cela évite de conserver durablement dans le navigateur des ressources susceptibles d’être obsolètes.

---

## Choix volontairement non implémentés

### Synchronisation multi-onglets

Une connexion ou déconnexion effectuée dans un onglet n’est pas propagée activement à tous les autres onglets déjà ouverts.

Une évolution pourrait écouter :

```text
storage event
```

ou utiliser `BroadcastChannel`.

Ce comportement n’est pas nécessaire au parcours principal du test.

---

### Refresh token

Le projet n’implémente pas de refresh token.

Le modèle d’authentification utilisé dépend directement du token fourni par SpaceTraders.

---

### Session serveur

Il n’existe pas de backend intermédiaire contrôlé par l’application.

Le projet n’utilise donc pas :

```text
HttpOnly cookie
server session
BFF
```

Une architecture de production pourrait faire un autre choix.

---

### Chiffrement local du token

Le token n’est pas « chiffré » avant son stockage dans le navigateur.

Un chiffrement dont la clé serait également disponible côté frontend ne protégerait pas réellement le secret contre un script exécuté dans le même contexte.

La priorité reste donc :

- ne jamais versionner le token ;
- limiter son usage au besoin ;
- éviter les manipulations inutiles ;
- rester explicite sur le compromis de sécurité.

---

### Annulation explicite du login

Une validation de token déjà lancée n’est pas explicitement annulée lorsque l’utilisateur navigue immédiatement ailleurs.

Le flux actuel reste simple et suffisant pour cette version.

Une évolution pourrait transmettre un signal à la mutation si ce comportement devenait réellement nécessaire.

---

## Évolutions possibles

Avec davantage de besoins, Auth pourrait évoluer vers :

- synchronisation multi-onglets ;
- gestion plus fine d’expiration ;
- backend-for-frontend ;
- session serveur ;
- cookies HttpOnly ;
- politiques de sécurité adaptées au contexte de production ;
- audit plus complet des événements d’authentification.

Ces évolutions dépendraient principalement de l’architecture backend et du modèle de menace réel, qui sortent du périmètre du test frontend actuel.
