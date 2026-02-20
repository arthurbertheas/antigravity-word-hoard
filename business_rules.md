# Regles Metiers - Antigravity Word Hoard (La Boite a mots)

Ce document recapitule l'ensemble des regles logiques et comportementales implementees dans l'application.

## 1. Donnees linguistiques

### Schema de mots (v7)

| Champ | Description | Exemple |
|-------|-------------|---------|
| `MOTS` | Orthographe du mot | `"abandonne"` |
| `PHONEMES` | Transcription phonetique (points separateurs, point initial) | `".a.b.a~.d.o.n.e"` |
| `GRAPHEMES` | Segmentation en graphemes | `".a.b.an.d.o.n.n.e"` |
| `SYNT` | Categorie syntaxique : NC, ADJ, VER, ADV, PRE, NP | `"ADJ"` |
| `APPUI LEXICAL` | Code frequence (1=tres familier, 4=non familier) | `"1"` |
| `NBSYLL` | Nombre de syllabes | `"4"` |
| `segmentation syllabique` | Decoupage syllabique (tirets) | `"a-ban-do-nne"` |
| `progression structure` | Code complexite syllabique (a a g) | `"d"` |
| `progression graphemes` | Code complexite graphemes (1 a 13) | `"5"` |
| `segmentation graphemes` | Graphemes separes par tirets | `"a-b-an-d-o-n-n-e"` |
| `GPMATCH` | Correspondance grapheme-phoneme | |
| `image associee` | URL de l'image SVG associee (Supabase Storage) | |

### Identifiant unique (uid)

Un mot est identifie par la combinaison de `MOTS` + `SYNT` + `PHONEMES` + `NBSYLL`. Cela permet d'avoir le meme mot avec des proprietes differentes (ex: homographes de categories differentes).

### Format PHONEMES

Le champ PHONEMES est stocke avec un point initial (`.p.a.p.a`). Pour obtenir les segments individuels, toujours utiliser `split('.').filter(Boolean)`. Ne jamais utiliser `startsWith` / `endsWith` sur la chaine brute.

### Categories syntaxiques

| Code | Signification |
|------|---------------|
| NC | Nom commun |
| ADJ | Adjectif |
| VER | Verbe |
| ADV | Adverbe |
| PRE | Preposition |
| NP | Nom propre |

## 2. Selection et Gestion des Listes

- **Synchronisation Webflow** : Chaque modification de la selection (ajout/retrait) envoie un message `selection_update` au site parent via postMessage.
- **Persistance locale** : La selection est sauvegardee dans `localStorage` (`wordHoard_selectedWords`). Les objets Word complets sont stockes, incluant les URLs d'images.
- **Migration URLs** : Si les URLs d'images changent (ex: migration Supabase), une migration automatique remplace les anciens IDs de projet dans les URLs stockees.
- **Listes sauvegardees** : Stockees dans Supabase (`user_word_lists`). Validation d'unicite du nom par utilisateur.
- **Normalisation** : Les listes sauvegardees peuvent contenir des mots en schema v3/v4. Normalisation automatique au chargement via `word-normalization.ts`.
- **Mode Focus** : Le lancement du tachistoscope necessite au moins un mot selectionne.

## 3. Filtrage

### Filtres progressifs
- **Structure syllabique** : 7 niveaux (a a g) de complexite croissante
- **Progression graphemes** : 13 niveaux de difficulte
- **Appui lexical** : 4 niveaux de familiarite (1 a 4)

### Filtres complementaires
- Categorie syntaxique, nombre de syllabes, longueur du mot, presence d'image

### Recherche ciblee (3 filtres)
- **Sequence de lettres**, **Grapheme**, **Phoneme**
- Chacun supporte un mode **Include** (Contient) ou **Exclude** (Sans)
- Positions : Partout, Debut, Milieu, Fin
- Double mode : filtrage temps reel (live) + tags persistants (figes par le bouton "+")
- Logique : tous les filtres se combinent en AND

### Selection aleatoire
- Algorithme Fisher-Yates
- Distribution equilibree selon les criteres include actifs
- Les criteres exclude sont respectes dans le filtrage mais ignores dans la repartition

## 4. Affichage et Regles Linguistiques

- **Segmentation** : Les mots sont segmentes en graphemes bases sur le champ `GRAPHEMES` (separateur `.`).
- **Coloration Dynamique** :
    - **Voyelles** : Identifiees via le lexique CGP (`cgp-tokens.json`) et colorees en rouge si l'option est active.
    - **Lettres Muettes** : Identifiees par les marqueurs `#` ou `*` dans le `GPMATCH` et colorees en gris.
- **Exceptions de Coloration** : Les mots de service "Pret ?" et "Bravo !" ne sont jamais colores (restent en noir).
- **Regles Contextuelles Speciales** :
    - **Le "e" contextuel (`e:`)** : Si active, le "e" est colore en **rouge**, et les consonnes qui le suivent (au maximum **deux**) sont colorees en **marron** (bordeaux).
    - **Digrammes a lettre muette (`qu`, `ge`, `gu`)** : Seule la deuxieme lettre (le 'u' ou le 'e') est coloree en gris muet.

## 5. Comportement du Tachistoscope (Diaporama)

- **Phases** : Alternance entre une phase d'exposition (`display`) et une phase de pause (`gap`).
- **Modes d'affichage** : Mot seul, Image seule, Mot + Image. Option "Double face" (l'image/mot se devoile au toucher).
- **Point de Fixation** : Une croix de fixation peut etre affichee durant la phase de pause.
- **Gestion du Bip Sonore** :
    - **Mode Manuel (Fleches)** : Le bip retentit exactement a l'apparition du mot.
    - **Mode Auto (Play)** : Le bip est anticipe de **500ms** avant l'apparition du mot (si l'intervalle le permet).
    - **Cas Particuliers** : Pas de bip pour le carton final "Bravo !". Le premier mot de la liste bipe toujours a l'affichage (pas d'anticipation).
- **Melange (Shuffle)** : Utilise l'algorithme Fisher-Yates. Si le mot "Bravo !" est present, il est systematiquement replace a la fin apres le melange.
- **Detection d'images** : Modes Image/Mot+Image grises si aucun mot de la queue n'a d'image. Avertissement ambre pour listes mixtes. Auto-reset vers mode "Mot" si les images sont retirees.
- **Polices** : Arial, Verdana, MDI Ecole, OpenDyslexic, Sans, Serif, Mono.
- **Espacements** : 3 modes (Lettres, Graphemes, Syllabes) avec apercu inline.
- **Panneau config** : Auto-hide apres 30s, scrollable.

## 6. Statistiques et Rapports

- **Calcul de Reussite** : Le taux de succes est calcule uniquement sur les mots evalues (Valides / (Valides + Echecs)). Le carton "Bravo !" est exclu des statistiques.
- **Etats des Mots** :
    - `neutral` : Mot non vu.
    - `validated` : Succes (Vert).
    - `failed` : Echec (Rouge).

## 7. Export

### Formats supportes
- **PDF** : Genere via `@react-pdf/renderer` (rendu vectoriel, texte net)
- **Word (.docx)** : Genere via la librairie `docx` avec `file-saver`

### Layouts (5 options)
1. **Liste** (1 colonne)
2. **2 colonnes**
3. **3 colonnes**
4. **Cartes** (flashcards)
5. **Tableau** (avec en-tetes, bordures, alternance de couleurs)

### Options de contenu
- Affichage : mot seul, image seule, mot + image
- Phonemes, categorie syntaxique, nombre de syllabes, segmentation syllabique
- Numerotation des mots, date, nombre de mots
- Titre et sous-titre personnalisables

### Mode session vs mode liste
- **Mode session** : inclut barre de progression, statuts colores (vert/rouge/gris), statistiques
- **Mode liste** : affichage neutre sans statuts, titre pre-rempli avec le nom de la liste

### Contraintes techniques PDF
- Images SVG converties en PNG base64 via canvas avant injection
- Images CDN pre-chargees en base64 (jamais d'URLs distantes dans @react-pdf/renderer)
- Font Sora sans variante italique (pas de `fontStyle: 'italic'`)
- Hyphenation desactivee pour les mots francais

## 8. Imagier phonetique

- **Grilles** : 2x3, 3x3, 3x4, 4x4 (portrait et paysage)
- **Contenu par carte** : image, mot, determinant, segmentation syllabique, phonemes, categorie, nb syllabes
- **Casse** : minuscule, MAJUSCULE, Capitalise
- **Taille police** : small (10pt), medium (12pt), large (15pt)
- **Guides de decoupe** : bordures en pointilles (gap = 0 quand actifs)
- **Determinants** : `getDeterminer()` retourne "" si non NC, "l'" si voyelle/h, "le" sinon. Pas de genre (m/f) dans la base donc desactive par defaut.
- **Export PDF** : `@react-pdf/renderer` avec font Sora (WOFF via fontsource CDN), conversion SVG->PNG

## 9. Communication postMessage (iframe)

| Message | Direction | Description |
|---------|-----------|-------------|
| `selection_update` | App -> Parent | Nombre de mots selectionnes |
| `focus_mode_change` | App -> Parent | Overlay ouvert/ferme (diaporama, imagier) |
| `close_overlay` | App -> Parent | Demande de fermeture de l'overlay courant |
| `launch_diaporama` | Parent -> App | Commande pour lancer le diaporama |
| `clear_selection_command` | Parent -> App | Vider la selection |
| `export_selection_command` | Parent -> App | Exporter la selection |
| `supabase_session` | Parent -> App | Relay de session auth cross-origin |

### Navigation back button
Toute la gestion `history` est centralisee dans le shell parent. L'iframe ne fait aucun appel a `pushState`/`replaceState`/`popstate`. Le parent gere les etats overlay/tool/page dans son propre historique.
