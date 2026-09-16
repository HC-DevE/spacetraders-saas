# Markets

Le module `markets` permet de consulter les ressources et les informations commerciales d’un marché SpaceTraders associé à un waypoint.

Le endpoint API est imbriqué sous `/systems/...`, mais le module reste séparé de `systems` car sa responsabilité fonctionnelle est commerciale : ressources, prix et transactions.

Cette première version est volontairement consultative. Elle n’implémente ni achat ni vente.

## Périmètre

La page :

```text
/systems/:systemSymbol/waypoints/:waypointSymbol/market
```

présente trois niveaux d’information.

### Ressources structurelles

Toujours représentées par le contrat Market :

- `exports` ;
- `imports` ;
- `exchange`.

Elles décrivent les ressources associées au marché indépendamment de la disponibilité des prix détaillés.

### Prix détaillés

Lorsque `tradeGoods` est fourni, l’interface affiche une table contenant :

- la ressource ;
- son type (`EXPORT`, `IMPORT`, `EXCHANGE`) ;
- le niveau de supply ;
- l’activité lorsqu’elle est fournie ;
- le volume ;
- le prix d’achat ;
- le prix de vente.

`activity` est facultatif et est affiché comme `Not reported` lorsqu’il est absent.

### Transactions récentes

Lorsque `transactions` est fourni, l’interface affiche :

- la ressource ;
- le type de transaction ;
- le symbole du vaisseau ;
- les unités ;
- le prix unitaire ;
- le total ;
- la date UTC.

Le symbole du vaisseau n’est pas transformé automatiquement en lien vers Fleet : une transaction de marché ne garantit pas que le vaisseau appartient à l’agent courant.

## Données détaillées indisponibles

`tradeGoods` et `transactions` sont facultatifs dans le contrat.

L’interface distingue donc trois situations :

```text
champ absent
→ information détaillée indisponible

champ présent mais []
→ information disponible, aucun élément retourné

champ présent avec des éléments
→ affichage de la table
```

L’absence de `tradeGoods` ne devient jamais :

- un marché vide ;
- un prix à zéro ;
- une erreur de validation.

Le même principe s’applique aux transactions.

## Responsabilités des fichiers

| Fichier ou dossier                       | Responsabilité                                       |
| ---------------------------------------- | ---------------------------------------------------- |
| `api/markets.api.ts`                     | Récupération et validation d’un marché               |
| `schemas/market.schema.ts`               | Contrat complet du marché                            |
| `composables/market.keys.ts`             | Clé TanStack Query du marché                         |
| `composables/use-market-query.ts`        | Query du marché                                      |
| `pages/MarketPage.vue`                   | Paramètres de route, états et composition de la page |
| `components/MarketResources.vue`         | Exports, imports et exchange                         |
| `components/MarketGoodsTable.vue`        | Table des prix détaillés                             |
| `components/MarketTransactionsTable.vue` | Table des transactions récentes                      |
| `shared/schemas/trade-symbol.schema.ts`  | Enum `TradeSymbol` partagé avec Fleet                |
| `shared/utils/formatters.ts`             | Formatage partagé des nombres, libellés et dates     |
| `tests/market.fixture.ts`                | Marchés représentatifs `full` et `partial`           |
| `tests/market.spec.ts`                   | Tests d’intégration du parcours Market               |

`MarketPage.vue` reste un orchestrateur. Le formatage des cellules et la définition des colonnes appartiennent aux composants de table.

## Tableaux

Les tables de prix et de transactions utilisent `@tanstack/vue-table`.

L’intégration reste volontairement minimale :

- définition typée des colonnes ;
- génération des headers et rows ;
- `FlexRender` pour le rendu ;
- aucune pagination locale ;
- aucun filtre local ;
- aucun tri ;
- aucune sélection de lignes.

La page ne charge qu’un marché, donc aucune fonctionnalité TanStack Table supplémentaire n’est ajoutée sans besoin produit réel.

## Appel réseau

```text
GET /systems/{systemSymbol}/waypoints/{waypointSymbol}/market
```

Le token est passé explicitement à `getMarket()`.

Après validation Zod, `market.symbol` doit correspondre au `waypointSymbol` demandé.

Une réponse appartenant à un autre waypoint produit une erreur `invalid-response`.

Le modèle Market ne contient pas `systemSymbol`; la cohérence du système ne peut donc pas être validée directement depuis l’objet retourné.

## Cache

La clé est :

```ts
;['markets', 'detail', systemSymbol, waypointSymbol]
```

Le système reste dans la clé même s’il n’est pas présent dans le modèle Market, car il fait partie de l’identité de l’endpoint demandé.

Le marché reste dans TanStack Query et n’est pas recopié dans Pinia.

## États d’interface

| Situation                    | Comportement                                       |
| ---------------------------- | -------------------------------------------------- |
| Premier chargement           | État de chargement                                 |
| Requête suspendue hors ligne | Message d’attente de connexion                     |
| Marché complet               | Ressources, prix et transactions                   |
| Marché partiel               | Ressources + explication des détails indisponibles |
| `tradeGoods: []`             | État vide `No priced goods reported`               |
| `transactions: []`           | État vide `No recent transactions`                 |
| `tradeGoods` absent          | `Detailed prices unavailable`                      |
| `transactions` absent        | `Transaction history unavailable`                  |
| Erreur initiale              | Message d’erreur et retry                          |
| Échec d’actualisation        | Dernières données conservées avec avertissement    |
| 404                          | État `Market not found`                            |
| Réponse invalide             | Erreur dédiée                                      |

## Navigation

Le marché est accessible uniquement depuis un waypoint dont le trait `MARKETPLACE` est connu.

La page Market expose :

- `Back to waypoint` vers le waypoint parent ;
- un lien vers le système parent.

Le module `markets` ne dépend pas de composants internes du module `systems`. Les deux modules communiquent par les routes et les symboles présents dans les données.

## Tests

### `market.spec.ts`

Vérifie notamment :

- transmission du token et identité du système/waypoint demandé ;
- rendu d’un marché complet ;
- ressources structurelles avec données détaillées absentes ;
- distinction entre tableaux vides et champs indisponibles ;
- `activity` facultatif ;
- réponse incomplète ;
- marché retourné pour un autre waypoint ;
- 404 ;
- conservation des données après un refresh échoué ;
- liens de retour vers le waypoint et le système.

Les réponses réseau sont simulées avec MSW.

### `systems-market.spec.ts`

Un parcours Playwright couvre l’intégration entre les modules `systems` et `markets`.

Le scénario testé est :

```text
Connexion
→ Systems
→ System
→ Waypoint Marketplace
→ Market
→ retour Waypoint
→ retour System
→ Systems
```

Ce test vérifie le parcours utilisateur principal plutôt que de reproduire tous les cas déjà couverts par `market.spec.ts`.

Les réponses SpaceTraders sont interceptées et simulées afin de conserver un E2E rapide, reproductible et indépendant de l’état du compte utilisé pour le développement.

## Choix de périmètre

### Consultation plutôt que trading

Cette première version est volontairement consultative.

Ajouter un bouton `Buy` ou `Sell` ne constituerait pas, à lui seul, une fonctionnalité de trading complète.

Une implémentation correcte demanderait notamment de gérer :

- le vaisseau utilisé pour la transaction ;
- sa présence au waypoint ;
- son état de navigation ;
- l’espace disponible dans sa cargaison ;
- les crédits de l’agent ;
- la quantité demandée ;
- les erreurs métier retournées par SpaceTraders ;
- l’état pending de la mutation ;
- la prévention des doubles soumissions ;
- l’invalidation du Market après transaction ;
- l’invalidation du Ship modifié ;
- l’invalidation ou la mise à jour de l’Agent lorsque les crédits changent.

Cette fonctionnalité traverserait donc `markets`, `fleet` et `agent`.

Elle a été laissée hors périmètre plutôt que d’être implémentée partiellement.

### TanStack Table volontairement minimal

TanStack Table est utilisé pour structurer les deux tableaux complexes :

```text
MarketGoodsTable
MarketTransactionsTable
```

Seul le cœur nécessaire au rendu est activé.

Le projet n’ajoute pas encore :

- tri ;
- filtrage local ;
- pagination locale ;
- sélection ;
- visibilité dynamique des colonnes ;
- virtualisation.

Le volume de données affiché ne justifie pas encore ces comportements.

L’utilisation actuelle permet néanmoins de disposer de définitions de colonnes typées et d’une structure qui pourra évoluer sans réécrire les tables.

### Transactions et navigation Fleet

Le symbole du vaisseau d’une transaction reste du texte.

Un Market peut contenir une transaction provenant d’un vaisseau qui n’appartient pas à l’agent courant.

Créer automatiquement :

```text
/fleet/:shipSymbol
```

aurait donc produit des liens potentiellement invalides vers `/my/ships/:symbol`.

Le lien sera pertinent uniquement si l’application peut garantir que le vaisseau concerné appartient à l’agent.

### Pas d’historique de prix

SpaceTraders fournit un état courant du marché et des transactions récentes, mais l’application ne persiste pas localement les observations successives.

Il n’existe donc pas :

- de graphique historique ;
- de tendance de prix ;
- de comparaison temporelle ;
- de calcul de volatilité.

Une vraie fonctionnalité de ce type demanderait une couche de stockage ou une source historique dédiée.

### Pas de comparaison automatique de marchés

La version actuelle consulte un marché dans son contexte géographique.

Comparer plusieurs marchés demanderait notamment :

- de sélectionner ou découvrir plusieurs waypoints Marketplace ;
- de charger plusieurs marchés ;
- de comparer les prix d’un même `TradeSymbol` ;
- d’intégrer éventuellement distance, consommation et capacité du vaisseau.

Cette évolution deviendrait progressivement une fonctionnalité de planification commerciale et sort du périmètre actuel.

### Actualisation

L’actualisation reste manuelle.

Aucun polling n’est ajouté par défaut afin d’éviter des requêtes régulières qui ne sont pas nécessaires au parcours consultatif.

Si une future fonctionnalité de trading ou de suivi actif nécessite des données plus fraîches, la politique de `staleTime`, de refetch et éventuellement de polling devra être définie explicitement.

## Ce que j’améliorerais avec plus de temps

Les évolutions prioritaires seraient :

1. Ajouter le tri des tables sur prix, volume ou supply.
2. Ajouter une recherche locale par `TradeSymbol`.
3. Comparer un produit entre plusieurs marketplaces.
4. Afficher une marge potentielle achat/vente.
5. Prendre en compte distance et consommation dans une estimation commerciale.
6. Ajouter un historique de prix si une source de données adaptée est disponible.
7. Implémenter un workflow complet d’achat et de vente.
8. Améliorer le rendu mobile des tables au-delà du simple scroll horizontal.
9. Ajouter une politique d’actualisation adaptée aux données commerciales.
10. Ajouter davantage de vérifications d’accessibilité automatisées.

## Limites et validation restante

Les principales extensions possibles sont détaillées ci-dessus.

La version actuelle reste volontairement :

- consultative ;
- sans mutation de crédits ou cargaison ;
- sans planification commerciale ;
- sans comparaison multi-marchés ;
- sans historique des prix ;
- sans polling automatique.

La recette finale doit encore vérifier :

- la lisibilité des tables sur petits écrans ;
- le défilement horizontal ;
- la navigation clavier ;
- le focus visible ;
- les textes longs ;
- le rechargement direct de la route Market après déploiement.

La réussite des tests automatisés ne constitue pas à elle seule une validation visuelle.
