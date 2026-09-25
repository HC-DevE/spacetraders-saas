# Authentification

## Objectif

Le module `auth` gère uniquement la session frontend nécessaire pour appeler l’API SpaceTraders.

SpaceTraders utilise un token Bearer fourni par l’utilisateur depuis la page de connexion.

Le module reste volontairement limité à :

```text
token
agentSymbol
connexion
persistance locale
déconnexion
protection des routes
```

Les ressources serveur complètes, comme l’objet `Agent`, ne sont pas stockées dans Pinia.

Elles restent gérées par TanStack Query.

---

# Flux de connexion

Le parcours principal est :

```text
Token saisi
    ↓
validation locale
    ↓
GET /my/agent
    ↓
validation SpaceTraders
    ↓
setToken()
    ↓
setAgentSymbol()
    ↓
suppression du cache précédent
    ↓
mise en cache de ['agent', 'current']
    ↓
navigation vers l'overview
```

Le token n’est donc jamais considéré comme valide uniquement parce qu’il a été saisi.

La validation réelle passe par :

```text
GET /my/agent
```

---

# Store Pinia

Le store Auth expose :

```ts
token
agentSymbol
hasToken

setToken()
setAgentSymbol()
clearToken()
```

Il ne contient pas :

```text
Agent complet
Ships
Systems
Waypoints
Markets
loading global
erreurs globales
```

Ces ressources sont du server state et restent dans TanStack Query.

---

# Token et identité de l’agent

Le store conserve deux valeurs distinctes :

```text
token
→ nécessaire pour authentifier les requêtes

agentSymbol
→ information d'identité légère utilisée par le shell
```

`agentSymbol` ne représente pas une duplication de l’objet Agent complet.

Il sert principalement à afficher l’identité de la session dans :

```text
AppHeader
```

Par exemple :

```text
Space Control               TEST   Sign out
```

---

## Pourquoi conserver `agentSymbol` ?

Le header est présent sur toutes les pages authentifiées.

Une alternative aurait été d’y exécuter :

```ts
useAgentQuery()
```

Cela aurait cependant couplé le shell à la ressource Agent et aurait pu provoquer des requêtes `/my/agent` depuis des écrans qui n’en ont pas besoin.

La V2 préfère donc :

```text
AppHeader
→ reçoit agentSymbol depuis Auth

AgentOverview
→ utilise useAgentQuery()
```

Le shell reste ainsi indépendant des données serveur détaillées.

---

# Persistance locale

La session utilise deux clés :

```text
space-control.agent-token
space-control.agent-symbol
```

Le token permet de restaurer l’authentification après un rechargement du navigateur.

Le symbole de l’agent permet de restaurer immédiatement l’identité visuelle du shell lorsqu’il est disponible.

---

## Lecture défensive du storage

Les accès à `localStorage` sont encapsulés dans une lecture défensive.

Une erreur du navigateur ne doit pas provoquer une exception au chargement de l’application.

Si aucune valeur exploitable n’est disponible :

```text
null
```

est utilisé.

---

# Persistance du token

`setToken()` suit une règle stricte :

```text
écriture localStorage
    ↓
succès
    ↓
mise à jour Pinia
```

Si le navigateur refuse l’écriture :

```text
la session n'est pas ouverte
```

et une erreur utilisateur est remontée.

Cela évite d’avoir :

```text
Pinia authentifié
+
storage non persisté
```

après une connexion qui semblait réussie.

---

# Persistance de `agentSymbol`

`agentSymbol` est traité différemment.

Une fois la session valide :

```text
agentSymbol
→ mis à jour en mémoire
```

puis l’application tente de le sauvegarder dans `localStorage`.

Si cette écriture échoue, la session reste valide.

Ce choix est volontaire :

```text
token
→ nécessaire à l'authentification

agentSymbol
→ métadonnée d'affichage
```

Une impossibilité de persister le symbole ne doit donc pas invalider un token fonctionnel.

---

# Pourquoi `localStorage` ?

Le frontend communique directement avec l’API SpaceTraders.

Le projet ne possède pas de backend intermédiaire permettant d’utiliser :

```text
session serveur
cookie HttpOnly
BFF
```

Dans ce contexte, `localStorage` constitue un compromis simple pour restaurer la session entre deux visites.

Ce choix est spécifique au périmètre du test technique.

Une application de production disposant de son propre backend pourrait utiliser une stratégie différente selon son modèle de sécurité.

---

# Validation locale du token

Avant l’appel réseau, le token est :

```text
trim()
```

puis validé comme non vide avec Zod.

L’objectif est uniquement d’éviter une requête manifestement invalide.

Le frontend ne tente pas de reproduire les règles internes de génération des tokens SpaceTraders.

La validation définitive appartient au serveur.

---

# Champ de token

Le champ est masqué par défaut :

```text
type="password"
```

L’utilisateur peut afficher ou masquer temporairement sa valeur grâce à un contrôle dédié.

La V2 utilise :

```ts
Eye
EyeOff
```

depuis :

```text
@lucide/vue
```

Le bouton expose :

```text
aria-pressed
aria-controls="agent-token"
aria-label dynamique
```

avec par exemple :

```text
Show agent token
Hide agent token
```

Les icônes sont décoratives :

```text
aria-hidden="true"
```

Le nom accessible reste porté par le bouton.

---

# Validation du token candidat

La connexion utilise :

```ts
getAgent(candidateToken)
```

Le token candidat est passé explicitement à la fonction API.

La fonction ne lit pas directement Pinia.

Cela permet de vérifier un token avant de modifier la session active.

---

# Une session existante n’est pas supprimée avant validation

Lorsqu’un nouveau token est soumis :

```text
session actuelle
+
token candidat
```

coexistent jusqu’à la réponse de SpaceTraders.

Le flux est :

```text
nouveau token candidat
    ↓
GET /my/agent
    ↓

succès
→ remplacement de session

échec
→ aucun remplacement
```

Une faute de saisie ne détruit donc pas prématurément une session valide.

---

# `useMutation`

La connexion est une action déclenchée explicitement par l’utilisateur.

Elle utilise donc :

```ts
useMutation()
```

et non `useQuery()`.

La mutation fournit directement :

```text
isPending
error
mutateAsync
reset
```

Il n’est pas nécessaire de recréer ces états dans Pinia.

La mutation de login possède également :

```text
retry: false
networkMode: always
gcTime: 0
```

Le login ne doit pas être rejoué automatiquement après un échec réseau.

---

# Succès de connexion

Le `onSuccess` de `useLogin()` effectue :

```ts
auth.setToken(token)

auth.setAgentSymbol(agent.symbol)

queryClient.removeQueries()

queryClient.setQueryData(['agent', 'current'], agent)
```

La réponse déjà obtenue pendant la validation est donc réutilisée.

Le parcours évite :

```text
login
→ GET /my/agent

navigation overview
→ GET /my/agent immédiatement à nouveau
```

---

# Cache et changement de session

Les query keys ne contiennent volontairement pas le token.

Exemple :

```ts
;['ships', 'list', { page, limit }]
```

et non :

```ts
['ships', token, 'list', ...]
```

L’application représente une seule session active à la fois.

Lors d’un changement d’agent, le cache précédent est donc supprimé.

Cela empêche d’afficher temporairement :

```text
ships de l'agent précédent
systems de l'agent précédent
market de l'agent précédent
```

dans la nouvelle session.

---

# Objet Agent

Le véritable objet Agent reste dans TanStack Query :

```ts
;['agent', 'current']
```

Il contient notamment :

```text
symbol
headquarters
credits
startingFaction
shipCount
```

`agentSymbol` dans Auth n’est qu’un snapshot minimal utilisé par l’interface globale.

---

# Restauration d’une session

Au chargement du store :

```text
token
→ relu depuis localStorage
```

Si un token existe, `agentSymbol` peut également être restauré.

Le routeur peut alors autoriser l’accès aux routes protégées.

Les données serveur, elles, ne sont pas persistées.

Après un refresh :

```text
session locale
→ restaurée

server state
→ rechargé par TanStack Query lorsqu'il est nécessaire
```

---

# Validité d’une session restaurée

La présence d’un token local ne constitue pas une validation serveur.

Un token restauré peut être :

```text
expiré
révoqué
invalide
```

Lorsqu’une query authentifiée utilise ce token, SpaceTraders reste la source de vérité.

Si l’API rejette l’authentification, la session est supprimée.

---

# Erreurs d’authentification globales

Le `QueryClient` possède un `QueryCache` avec un traitement global des erreurs d’authentification.

Lorsqu’une query retourne :

```text
ApiError
kind = authentication
```

et qu’une session est active :

```text
clearToken()
    ↓
queryClient.clear()
```

Le store perd alors :

```text
token
agentSymbol
```

et leurs valeurs persistées sont supprimées.

---

# Retour automatique vers Login

`AppLayout` observe :

```ts
auth.hasToken
```

Lorsque cette valeur devient fausse :

```text
AppLayout
→ router.replace(login)
```

Une session rejetée par SpaceTraders provoque donc automatiquement :

```text
erreur d'authentification
    ↓
session nettoyée
    ↓
cache nettoyé
    ↓
retour Login
```

Chaque page n’a pas besoin de réimplémenter ce comportement.

---

# Déconnexion

Le logout utilise :

```ts
auth.clearToken()
```

dans un `try/finally`, puis :

```ts
queryClient.clear()
```

Le nettoyage du cache est donc exécuté même si la suppression du storage rencontre un problème.

La disparition du token entraîne ensuite le retour vers `/login` via `AppLayout`.

---

# Protection des routes

Le routeur utilise :

```text
meta.requiresAuth
```

sur `AppLayout`.

Toutes ses routes enfants sont ainsi protégées :

```text
/
fleet
ship detail
systems
system detail
waypoint detail
market
```

Lorsqu’aucun token n’est présent :

```text
route protégée
→ /login
```

---

# Route Login

L’inverse est également traité.

Lorsqu’un utilisateur déjà authentifié ouvre :

```text
/login
```

le routeur le redirige vers :

```text
agent overview
```

Cela évite d’exposer inutilement un nouveau formulaire de connexion pendant une session active.

---

# Client HTTP et dépendances explicites

Les fonctions API reçoivent toujours le token explicitement.

Exemples :

```ts
getAgent(token)

getShips(token, params)

getShip(token, symbol)

getSystem(token, systemSymbol)

getMarket(token, systemSymbol, waypointSymbol)
```

Le client HTTP construit ensuite :

```http
Authorization: Bearer <token>
```

Les fonctions API restent indépendantes de Pinia.

---

# Pourquoi ne pas lire Pinia depuis Axios ?

Un interceptor Axios qui lirait directement Auth produirait une dépendance implicite :

```text
API
↓
Axios global
↓
Pinia
```

Le projet préfère :

```ts
getShip(token, symbol)
```

La dépendance devient visible dans la signature.

Cela facilite :

```text
tests
raisonnement
validation d'un token candidat
réutilisation des fonctions API
```

---

# Annulation des requêtes

Les queries TanStack Query transmettent leur `AbortSignal` aux fonctions API :

```ts
queryFn: ({ signal }) => getShip(token, symbol, signal)
```

Le signal est ensuite propagé jusqu’à Axios.

Il n’est pas nécessaire de créer un `AbortController` spécifique dans chaque composant.

---

# États de la page Login

L’interface distingue notamment :

| Situation                  | Comportement                           |
| -------------------------- | -------------------------------------- |
| Token vide                 | Erreur locale, aucune requête          |
| Validation en cours        | Bouton désactivé et état de chargement |
| Token valide               | Création de session puis navigation    |
| Token rejeté               | Erreur affichée, aucune session créée  |
| Erreur réseau              | Erreur affichée sans retry automatique |
| Token modifié après erreur | L’erreur précédente est réinitialisée  |
| Double soumission          | Une seule requête est envoyée          |
| Storage indisponible       | La session n’est pas ouverte           |

Le champ reprend également le focus après une erreur de validation locale.

---

# Accessibilité

Le formulaire utilise notamment :

```text
Label explicite
aria-invalid
aria-describedby
role="alert"
role="status"
aria-busy
focus restauré sur erreur locale
bouton Show / Hide nommé
```

Les locators utilisés dans les tests E2E reposent sur ces noms accessibles.

Exemples :

```ts
page.getByRole('textbox', {
  name: 'Agent token',
})

page.getByRole('button', {
  name: 'Connect',
})
```

---

# Sécurité

Aucun token réel ne doit être présent dans :

```text
repository
fixtures
tests
captures
logs
fichiers .env versionnés
```

Les tests utilisent uniquement des tokens fictifs.

Exemples :

```text
test-agent-token
e2e-agent-token
e2e-systems-market-token
```

Le token n’est pas chiffré avant stockage local.

Un chiffrement dont la clé serait elle-même disponible côté frontend ne fournirait pas une protection utile contre un script exécuté dans le même contexte.

Le choix principal reste donc d’éviter toute fuite ou version accidentelle.

---

# Tests

Les tests Auth couvrent notamment :

```text
route protégée sans session
validation locale d'un token vide
connexion avec une seule requête
persistance du token
persistance de agentSymbol
nettoyage du cache précédent
token rejeté
reset d'une erreur après modification du champ
erreur de localStorage
échec réseau sans replay automatique
restauration de session
rejet d'un token restauré
expiration après connexion
double soumission
logout
```

Les appels réseau sont simulés avec MSW.

Les tests n’utilisent jamais le service SpaceTraders réel.

---

# E2E

Le scénario Playwright principal vérifie également :

```text
route protégée
→ Login

Login
→ Agent overview

reload
→ session restaurée

Fleet
→ Ship detail

Sign out
→ Login

reload
→ ancienne session absente

URL protégée directe
→ Login
```

Ce scénario protège le cycle de vie complet de la session dans un navigateur réel.

---

# Limites actuelles

La version actuelle ne gère pas :

```text
refresh token
synchronisation multi-onglets
session serveur
cookie HttpOnly
expiration proactive
BroadcastChannel
```

Ces besoins dépendraient d’un contexte de production différent et d’un backend applicatif contrôlé par le projet.

Ils ne sont pas nécessaires au périmètre actuel.
