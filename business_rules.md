# Règles Métiers - Antigravity Word Hoard

Ce document récapitule l'ensemble des règles logiques et comportementales implémentées dans l'application.

## 1. Sélection et Gestion des Listes

- **Identification Unique** : Un mot est identifié par la combinaison de son orthographe (`ORTHO`), sa catégorie syntaxique (`SYNT`), sa phonétique (`PHON`) et son nombre de syllabes (`NBSYLL`).
- **Synchronisation Webflow** : Chaque modification de la sélection (ajout/retrait) envoie un message `selection_update` au site parent via Iframe postMessage.
- **Persistance des Listes** : Les listes sont sauvegardées dans Supabase. Une validation empêche la création de deux listes portant le même nom pour un même utilisateur.
- **Mode Focus** : Le lancement du tachistoscope nécessite qu'au moins un mot soit sélectionné.

## 2. Affichage et Règles Linguistiques

- **Segmentation** : Les mots sont segmentés en graphèmes basés sur la propriété `GSEG` (séparateur `.`).
- **Coloration Dynamique** :
    - **Voyelles** : Identifiées via le lexique CGP et colorées en rouge si l'option est active.
    - **Lettres Muettes** : Identifiées par les marqueurs `#` ou `*` dans le `GPMATCH` et colorées en gris.
- **Exceptions de Coloration** : Les mots de service "Prêt ?" et "Bravo !" ne sont jamais colorés (restent en noir).
- **Règles Contextuelles Spéciales** :
    - **Le "e" contextuel (`e:`)** : Si activé, le "e" est coloré en **rouge**, et les consonnes qui le suivent (au maximum **deux**) sont colorées en **marron** (bordeaux). Ex: *mer* -> e (rouge) r (marron). *extraterrestre* -> e (rouge) x,t (marron).
    - **Digrammes à lettre muette (`qu`, `ge`, `gu`)** : Seule la deuxième lettre (le 'u' ou le 'e') est colorée en gris muet.

## 3. Comportement du Tachistoscope (Diaporama)

- **Phases** : Alternance entre une phase d'exposition (`display`) et une phase de pause (`gap`).
- **Point de Fixation** : Une croix de fixation peut être affichée durant la phase de pause pour guider le regard.
- **Gestion du Bip Sonore** :
    - **Mode Manuel (Flèches)** : Le bip retentit exactement à l'apparition du mot.
    - **Mode Auto (Play)** : Le bip est anticipé de **500ms** avant l'apparition du mot (si l'intervalle le permet).
    - **Cas Particuliers** : Pas de bip pour le carton final "Bravo !". Le premier mot de la liste bipe toujours à l'affichage (pas d'anticipation).
- **Mélange (Shuffle)** : Utilise l'algorithme Fisher-Yates. Si le mot "Bravo !" est présent, il est systématiquement replacé à la fin de la file après le mélange.

## 4. Statistiques et Rapports

- **Calcul de Réussite** : Le taux de succès est calculé uniquement sur les mots évalués (Validés / (Validés + Échecs)). Le carton "Bravo !" est exclu des statistiques.
- **États des Mots** :
    - `neutral` : Mot non vu.
    - `validated` : Succès (Vert).
    - `failed` : Échec (Rouge).
- **Export PDF** : Génère un rapport incluant la date de session, la durée totale, les statistiques globales et le détail mot par mot avec les symboles ✓ (succès), ✗ (échec) ou — (non vu).
