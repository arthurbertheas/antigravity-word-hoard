# Changelog

## [7.5.0] - 2026-02-19

Export depuis les listes sauvegardees, corrections PDF/Word, navigation back button centralisee.

### Export depuis listes sauvegardees

- **Action unique "Exporter"** : Les 3 actions separees (PDF, Word, Imprimer) remplacees par un seul bouton "Exporter" qui ouvre le panneau d'export complet
- **Titre pre-rempli** : Le nom de la liste est utilise comme titre initial du document
- **Mode liste** : Export sans statistiques de session (pas de barre de progression ni de statuts colores)

### Corrections Export PDF

- **Images CDN Twemoji** : Les icones du header (calendrier, tag) sont maintenant pre-chargees en base64 avant le rendu PDF, evitant les crashs de `@react-pdf/renderer` sur les fetches distants
- **Font Sora italic** : Retire `fontStyle: 'italic'` sur le style phoneme (Sora n'a pas de variante italique)
- **Z-index modal** : Le panneau d'export est rendu via `createPortal(jsx, document.body)` pour eviter les problemes de stacking context CSS

### Corrections Export Word

- **Bordures tableau** : Ajout des 4 bordures explicites sur toutes les cellules (header et data) pour eviter les bordures manquantes dans le rendu Word
- **Accent header** : Bordure inferieure violette (6pt) sur la ligne d'en-tete du tableau

### Navigation back button

- **Centralisation** : Toute la gestion `history` est desormais centralisee dans le shell parent. L'iframe ne fait plus aucun appel a `pushState`/`replaceState`/`popstate`
- **Overlay management** : Le parent pousse une entree history quand un overlay s'ouvre, et la depile quand il se ferme (par Back ou par X/Escape)
- **Message `close_overlay`** : Nouveau message postMessage pour que le parent demande la fermeture d'un overlay

## [7.4.0] - 2026-02-18

Filtres include/exclude, bugfixes, consolidation Supabase.

### Filtres Include/Exclude

- **Mode Contient/Sans** : Les 3 filtres de recherche ciblee (Sequence de lettres, Grapheme, Phoneme) supportent l'inclusion ET l'exclusion via un toggle
- **ModeToggle** : Composant reutilisable avec icones Check/X, style indigo (include) / rouge (exclude)
- **Grille IPA** : Les phonemes deja ajoutes sont mis en surbrillance (indigo = include, rouge = exclude)
- **Tags exclude** : S'affichent en rouge avec prefixe "Sans" dans la barre de filtres actifs
- **Selection aleatoire** : Les criteres exclude sont ignores dans la distribution (seuls les include participent)

### Bugfixes filtres

- **Filtres realtime + exclude** : Les filtres live (grapheme, phoneme) respectent desormais le mode exclude
- **Position phoneme "Debut"** : Corrige le matching par segments (`split('.').filter(Boolean)`) au lieu de `startsWith` sur la chaine brute
- **Position select** : Passe en rouge quand le mode est "Sans"

### Consolidation Supabase

- **Projet unique** : Tout repointe vers `wxttgpfipcksseykzeyy` apres la suppression accidentelle de l'ancien projet
- **Migration URLs images** : Les anciennes URLs dans localStorage sont automatiquement migrees
- **Auth relay** : Session Supabase transmise via postMessage pour l'iframe cross-origin

### Appui Lexical — Redesign

- **Chips monochrome indigo** : Labels complets (Tres familier, Familier, etc.) avec badges romains (I, II, III, IV)
- **Labels ortho** : GRAPHEME_LABELS et STRUCTURE_LABELS corriges selon retour orthophoniste

## [7.3.0] - 2026-02-16

Refonte majeure du panneau d'export et de l'imagier.

### Export Modal — Redesign complet

- **Modal avec tabs** : Document (5 layouts visuels) + Contenu (options d'affichage, phonemes, categories, etc.)
- **Format selector en footer** : PDF / Word avec bouton de telechargement
- **Apercu A4** : Rendu en temps reel qui se met a jour a chaque changement de parametre
- **@react-pdf/renderer** : Migration de jsPDF vers @react-pdf/renderer pour le rendu PDF vectoriel
- **Images dans les exports** : Les images SVG des mots sont converties en PNG base64 et integrees dans les PDF et Word
- **5 layouts** : Liste, 2 colonnes, 3 colonnes, Cartes (flashcards), Tableau
- **Suppression de l'export Print** : Seuls PDF et Word sont conserves

### Imagier phonetique

- **@react-pdf/renderer** : Rendu PDF vectoriel (texte net, pas de pixelisation)
- **Conversion SVG→PNG** : Via canvas pour compatibilite avec @react-pdf/renderer
- **Determinants** : Gestion de l'elision francaise (l'ambulance vs le chat), desactive par defaut (pas de genre)
- **Grilles** : 2x3, 3x3, 3x4, 4x4 en portrait et paysage
- **Options** : mot, determinant, syllabe, phoneme, categorie, nb syllabes, casse, taille police, guides de decoupe

### Persistance selection

- **localStorage** : La selection de mots est sauvegardee dans le navigateur et restauree au rechargement

## [7.2.0] - 2026-02-15

Refonte majeure UX/UI du panneau de filtres, du panneau de selection et des
parametres du diaporama. Focus sur la lisibilite, la coherence visuelle et
l'ergonomie pour les orthophonistes.

### Panneau Filtres — Refonte complete

- **Nouvelle organisation** : 3 groupes de filtres (Progressifs, Complementaires, Recherche ciblee) avec dividers violet `#6C5CE7`
- **Renommages** : Recherche -> "Sequence de lettres", Frequence -> "Appui lexical", labels de structure syllabique et graphemes mis a jour
- **Grapheme** : titre au singulier, icone custom ABC blocks, 13 niveaux avec labels descriptifs
- **Phoneme** : titre au singulier, icone oreille (Ear), grille Consonnes/Voyelles separee
- **Filtrage live** : Grapheme et Phoneme filtrent desormais en temps reel (comme Sequence de lettres) — la liste se met a jour a chaque frappe ou clic, le bouton "+" fige le filtre en tag persistant
- **Bouton Vider** : deplace dans la barre de compteur, style ghost pill avec confirmation
- **Fix Unicode** : phoneme `ɔ̃` -> `o~` pour matcher l'encodage reel des donnees

### Panneau Selection — Enrichissement

- **Renommages** : "Ma Liste" -> "Ma selection", "Liste de travail" -> "Listes enregistrees", CTA "Lancer la selection" -> "Lancer le diaporama"
- **Items enrichis** : chaque mot affiche categorie syntaxique (badge), nombre de syllabes, indicateur d'image
- **Nettoyage** : suppression du compteur de syllabes et de la moyenne dans le header

### Diaporama Settings — Refonte du SidePanel

- **Restructuration tabs** : passage de 4 onglets a 2 ("Affichage" + "Aides a la lecture")
- **Mode d'affichage redesigne** : 5 radios plats -> 3 cartes visuelles (Mot / Image / Mot + Image) avec icones + toggle "Double face" contextuel
- **Gestion des images** : detection automatique, warning ambre pour listes mixtes, auto-reset du mode
- **Contraste ameliore** : opacity 60% pour disabled, bordures renforcees
- **Panel auto-ouvert** : s'ouvre par defaut sur l'onglet Affichage, auto-hide apres 30s
