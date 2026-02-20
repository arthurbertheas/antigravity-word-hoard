# Rules

- TOUJOURS push après chaque commit. Pas de commit sans push.
- Langue de communication : français. Code et commentaires : anglais.
- **Mise à jour CLAUDE.md obligatoire** : Après chaque fonctionnalité livrée ou changement significatif, mettre à jour la section "Travail en cours" de ce fichier. Inclure : ce qui a été fait, les fichiers modifiés, les décisions prises, et ce qui reste à faire. Cela sert de mémoire persistante entre sessions.

---

# Antigravity Word Hoard — Savoir métier

## Projet

Application web d'exploration et de manipulation de mots français, destinée aux orthophonistes.
Produit par **MaterielOrthophonie.fr**. Embarqué en iframe dans un site Webflow.

**Stack** : Vite + React 18 + TypeScript + Tailwind CSS + shadcn-ui + Supabase

## Données linguistiques

### Base de mots (`src/data/words.json`)

~2 400 mots français, schéma **v7** (migré depuis v3/v4 via `word-normalization.ts`).

| Champ | Description | Exemple |
|---|---|---|
| `MOTS` | Orthographe du mot | `"abandonné"` |
| `PHONEMES` | Transcription phonétique (points séparateurs) | `".a.b.ã.d.o.n.e"` |
| `GRAPHEMES` | Segmentation en graphèmes | `".a.b.an.d.o.n.n.é"` |
| `SYNT` | Catégorie syntaxique : NC, ADJ, VER, ADV, PRE, NP | `"ADJ"` |
| `APPUI LEXICAL` | Code fréquence (1=très familier → 4=non familier) | `"1"` |
| `NBSYLL` | Nombre de syllabes | `"4"` |
| `segmentation syllabique` | Découpage syllabique | `"a-ban-do-nné"` |
| `progression structure` | Code complexité syllabique (a→g) | `"d"` |
| `progression graphèmes` | Code complexité graphèmes (1→13) | `"5"` |
| `segmentation graphèmes` | Graphèmes séparés par tirets | `"a-b-an-d-o-n-n-é"` |
| `GPMATCH` | Correspondance graphème-phonème | |
| `image associée` | URL de l'image SVG associée | URL Supabase |

### Catégories syntaxiques (`SYNT`)

- **NC** = Nom commun
- **ADJ** = Adjectif
- **VER** = Verbe
- **ADV** = Adverbe
- **PRE** = Préposition
- **NP** = Nom propre

### Progression structure (complexité syllabique)

| Code | Description |
|------|-------------|
| a | Syllabes simples (CV) |
| b | Voyelle initiale / consonne finale |
| c | E final muet |
| d | Consonnes doubles |
| e | Consonnes muettes |
| f | CC et VV simples |
| g | CC et VV complexes |

### Progression graphèmes (1→13)

Niveaux de difficulté croissante des graphèmes, de "très simples" (1) à "e contextuel" (13). Voir `GRAPHEME_LABELS` dans `src/types/word.ts`.

### Images

Toutes les images de mots sont des **SVG** hébergés sur Supabase Storage :
```
https://wxttgpfipcksseykzeyy.supabase.co/storage/v1/object/public/word-images/svg/{nom}.svg
```

**Contrainte PDF** : `@react-pdf/renderer` ne supporte pas le SVG. Les images doivent être converties en PNG base64 via canvas avant injection dans le PDF (voir `imagier-image-utils.ts`).

### Déterminants français

La fonction `getDeterminer()` dans `imagier-utils.ts` retourne :
- `""` si le mot n'est pas un NC
- `"l'"` si le mot commence par une voyelle/h (élision)
- `"le"` sinon

**Limitation connue** : pas de données de genre (masculin/féminin) dans la base → impossible de distinguer "le" / "la". La fonctionnalité `showDeterminer` est désactivée par défaut.

### Correspondance graphème-phonème (CGP)

Fichier `src/data/cgp-tokens.json` — utilisé pour l'analyse linguistique fine (voyelles, consonnes, lettres muettes).

## Architecture

### Point d'entrée

`src/pages/Index.tsx` → `src/components/WordExplorer.tsx`

### State management (React Context)

| Context | Rôle |
|---------|------|
| `SelectionContext` | Mots sélectionnés, ajout/suppression/random, communication Webflow |
| `PlayerContext` | État du tachistoscope (queue, index, play/pause, statuts, session) |
| `SavedListsContext` | Listes sauvegardées dans Supabase, CRUD, sync |

### Fonctionnalités principales

#### 1. Explorateur de mots
- Filtrage multi-critères (catégorie, syllabes, structure, graphèmes, phonèmes, fréquence, longueur, image)
- Recherche temps réel par début/fin/milieu/partout
- Pagination (12, 24, 48, 96 mots/page)
- Statistiques dynamiques sur les résultats filtrés

#### 2. Sélection & Export
- Sélection manuelle ou aléatoire (Fisher-Yates shuffle)
- Export **PDF** (jsPDF) : liste, grille 2-3 colonnes, flashcards, tableau
- Export **Word** (docx) : tableau avec images et couleurs
- Export **Print** : via boîte de dialogue navigateur
- Codes couleur de statut : validé (vert), raté (rouge), neutre (gris), pas vu (gris clair)

#### 3. Tachistoscope (diaporama)
- Affichage chronométré de mots (vitesse configurable)
- Polices : Arial, Verdana, MDI École, OpenDyslexic, Sans, Serif, Mono
- Modes : mot seul, image, alternance mot/image
- Mise en surbrillance : voyelles, lettres muettes
- Espacement : lettres, graphèmes, syllabes
- Point de fixation (focus)
- Suivi de session : validé/raté/sauté, log avec timestamps
- Sauvegarde des réglages dans Supabase

#### 4. Imagier (livret d'images)
- Grilles : 2×3, 3×3, 3×4, 4×4 (portrait & paysage)
- PDF vectoriel via `@react-pdf/renderer` (texte net, pas de pixelisation)
- Options : mot, déterminant, syllabe, phonème, catégorie, nb syllabes
- Casse : minuscule, MAJUSCULE, Capitalisé
- Taille police : small (10), medium (12), large (15)
- Guides de découpe (pointillés)
- En-tête/pied de page personnalisables
- Multi-page automatique
- Conversion SVG→PNG pour les images (via canvas)

#### 5. Listes sauvegardées
- CRUD dans Supabase (`user_word_lists`)
- Tags, description, compteur de mots
- Normalisation v3→v7 au chargement
- Utilisateur identifié via Memberstack

### Communication Webflow (postMessage)

L'app est embarquée en iframe. Messages échangés :
- `selection_update` : notifie le parent du nombre de mots sélectionnés (App → Parent)
- `focus_mode_change` : overlay ouvert/fermé (App → Parent)
- `close_overlay` : demande de fermeture d'overlay (Parent → App)
- `close_tool` : demande de retour au catalogue (App → Parent, legacy)
- `launch_diaporama` : commande pour lancer le diaporama (Parent → App)
- `clear_selection_command` / `export_selection_command` : commandes depuis le parent
- `supabase_session` : relay de session auth cross-origin (Parent → App)
- `resize` / `scroll_to_offset` : signaux de layout (App → Parent)

**Navigation back button** : Toute la gestion `history` est centralisée dans le shell parent. L'iframe ne fait aucun appel à `pushState`/`replaceState`/`popstate`.

## Design system

### Couleurs

| Token | Valeur | Usage |
|-------|--------|-------|
| Primary | `#6C5CE7` | Boutons, accents, barre violette |
| Primary hover | `#5A4BD1` | |
| Accent | teal `174 72% 56%` | Éléments secondaires |
| Destructive | rouge | Actions de suppression |

### Typographie

| Famille | Usage | Source |
|---------|-------|--------|
| **Sora** | Titres, display, PDF headers | Google Fonts + fontsource CDN (WOFF) |
| **DM Sans** | Corps de texte | Google Fonts |
| **IBM Plex Mono** | Code, données techniques | Google Fonts |
| **OpenDyslexic** | Accessibilité dyslexie | `/public/fonts/` |
| **MDI École** | Police scolaire | `/public/fonts/` |

### UI

- shadcn-ui (40+ composants Radix UI)
- Lucide React (icônes)
- Sonner (toast notifications)
- Tailwind CSS 3.4 avec animations custom

## Backend

### Supabase

- **URL** : `https://wxttgpfipcksseykzeyy.supabase.co` (projet "Matériel Orthophonie")
- **Tables** :
  - `user_word_lists` : listes sauvegardées par utilisateur
  - `user_tachistoscope_settings` : réglages du tachistoscope
- **Storage** : images SVG des mots (bucket `word-images`)
- **Auth** : Supabase Auth (`supabase.auth.getUser()`), gate standalone dans `index.html`

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `src/components/WordExplorer.tsx` | Composant principal de l'app |
| `src/hooks/useWords.ts` | Logique de filtrage et statistiques |
| `src/contexts/PlayerContext.tsx` | État du tachistoscope |
| `src/contexts/SelectionContext.tsx` | État de la sélection |
| `src/contexts/SavedListsContext.tsx` | Gestion des listes |
| `src/lib/export-utils.ts` | Export Word (.docx) |
| `src/components/export/ExportPanel.tsx` | Modal d'export (PDF + Word) |
| `src/components/export/ExportPdfDocument.tsx` | Layout PDF vectoriel (@react-pdf) pour export |
| `src/components/export/ExportPreview.tsx` | Aperçu A4 temps réel |
| `src/lib/supabase.ts` | Client Supabase + types DB |
| `src/utils/word-normalization.ts` | Migration v3/v4 → v7 |
| `src/utils/imagier-utils.ts` | Helpers imagier (déterminants, casse, phonèmes) |
| `src/utils/imagier-image-utils.ts` | Conversion SVG→PNG pour PDF |
| `src/components/imagier/ImagierPdfDocument.tsx` | Layout PDF vectoriel (@react-pdf) |
| `src/types/word.ts` | Modèle de données Word + filtres |
| `src/types/imagier.ts` | Types et config de l'imagier |
| `src/types/export.ts` | Types et config de l'export |
| `src/data/words.json` | Base de ~2 400 mots (v7) |
| `src/data/cgp-tokens.json` | Tokens graphème-phonème |

## Travail en cours (session 20/02/2026)

Toutes les features majeures sont livrées et pushées. Pas de tâche en cours.

### Résumé des features livrées

| Feature | Version | Statut |
|---------|---------|--------|
| Filtres Include/Exclude | 7.4.0 | LIVRÉ |
| Appui Lexical redesign (chips indigo) | 7.4.0 | LIVRÉ |
| Labels ortho corrigés | 7.4.0 | LIVRÉ |
| Consolidation Supabase (projet unique) | 7.4.0 | LIVRÉ |
| Export modal redesign (PDF + Word) | 7.3.0 | LIVRÉ |
| Imagier phonétique (@react-pdf) | 7.3.0 | LIVRÉ |
| Export depuis listes sauvegardées | 7.5.0 | LIVRÉ |
| Navigation back button centralisée | 7.5.0 | LIVRÉ |
| Corrections PDF (Twemoji base64, italic, z-index) | 7.5.0 | LIVRÉ |
| Corrections Word (bordures tableau) | 7.5.0 | LIVRÉ |

### Actions manuelles restantes (Supabase/Vercel)
- [ ] Créer les comptes utilisateurs dans Authentication > Users (si pas déjà fait)
- [ ] Mettre à jour les env vars Vercel (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY pour wxttgpfipcksseykzeyy)

## Pièges connus

- **SVG dans les PDF** : `@react-pdf/renderer` ne supporte pas le SVG → convertir en PNG base64 via canvas
- **Font italic Sora** : Sora n'a pas de variante italique → ne jamais utiliser `fontStyle: 'italic'` dans les styles PDF
- **Images CDN dans PDF** : `@react-pdf/renderer` `<Image src="url">` échoue silencieusement si le fetch CDN rate (CORS, redirect, timeout). Ne jamais utiliser d'images CDN distantes dans les composants PDF — pré-charger en base64 ou utiliser du texte
- **Déterminants** : pas de genre dans la base → `showDeterminer` désactivé par défaut
- **CORS images** : les fetch d'images Supabase nécessitent `mode: 'cors'`
- **Hyphenation PDF** : désactivée (`Font.registerHyphenationCallback(word => [word])`) pour ne pas couper les mots français
- **Normalisation** : les listes sauvegardées peuvent contenir des mots en schéma v3/v4 → toujours normaliser au chargement
- **Format PHONEMES** : stocké avec point initial (`.p.a.p.a`). Toujours utiliser `split('.').filter(Boolean)` pour obtenir les segments, ne jamais utiliser `startsWith`/`endsWith` sur la chaîne brute
- **localStorage sélection** : `wordHoard_selectedWords` stocke les objets Word complets (avec URLs d'images). Si les URLs changent (migration Supabase, etc.), le localStorage garde les anciennes. Migration ajoutée dans `SelectionContext.tsx` pour remplacer l'ancien projet ID.
- **Vercel build cache** : Vercel cache les assets entre déploiements. Si `words.json` change, forcer un redeploy sans cache (Deployments → ... → Redeploy → décocher "Use existing Build Cache")
