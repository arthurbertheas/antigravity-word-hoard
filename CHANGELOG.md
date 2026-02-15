# Changelog

## [7.2.0] - 2026-02-15

Refonte majeure UX/UI du panneau de filtres, du panneau de sélection et des
paramètres du diaporama. Focus sur la lisibilité, la cohérence visuelle et
l'ergonomie pour les orthophonistes.

### Panneau Filtres — Refonte complète

- **Nouvelle organisation** : 3 groupes de filtres (Progressifs, Complémentaires, Recherche ciblée) avec dividers violet `#6C5CE7`
- **Renommages** : Recherche → "Séquence de lettres", Fréquence → "Appui lexical", labels de structure syllabique et graphèmes mis à jour
- **Graphème** : titre au singulier, icône custom ABC blocks, 13 niveaux avec labels descriptifs
- **Phonème** : titre au singulier, icône oreille (Ear), grille Consonnes/Voyelles séparée
- **Filtrage live** : Graphème et Phonème filtrent désormais en temps réel (comme Séquence de lettres) — la liste se met à jour à chaque frappe ou clic, le bouton "+" fige le filtre en tag persistant
- **Bouton Vider** : déplacé dans la barre de compteur, style ghost pill avec confirmation
- **Fix Unicode** : phonème `ɔ̃` → `õ` pour matcher l'encodage réel des données

### Panneau Sélection — Enrichissement

- **Renommages** : "Ma Liste" → "Ma sélection", "Liste de travail" → "Listes enregistrées", CTA "Lancer la sélection" → "Lancer le diaporama"
- **Items enrichis** : chaque mot affiche catégorie syntaxique (badge), nombre de syllabes, indicateur d'image
- **Nettoyage** : suppression du compteur de syllabes et de la moyenne dans le header

### Diaporama Settings — Refonte du SidePanel

- **Restructuration tabs** : passage de 4 onglets à 2 ("Affichage" + "Aides à la lecture")
- **Mode d'affichage redesigné** : 5 radios plats → 3 cartes visuelles (Mot / Image / Mot + Image) avec icônes + toggle "Double face" contextuel
  - Décomposition orthogonale : type de contenu + mode double face, sans breaking change sur `PlayerSettings.displayMode`
  - Description dynamique : "L'image se dévoile au toucher" / "Le mot se dévoile au toucher"
  - Mode Espacements avec cartes visuelles (Lettres / Graphèmes / Syllabes) et preview inline
- **Gestion des images** :
  - Détection automatique : cartes Image/Mot+Image grisées si aucune image dans la queue
  - Warning ambre pour listes mixtes : "X mot(s) sans image — il(s) s'affichera(ont) en texte seul"
  - Auto-reset du mode vers "Mot" si les images sont retirées de la queue
- **Contraste amélioré** : opacity 60% pour disabled, text-foreground/70 pour labels, bordures renforcées sur tous les blocs muted (les 2 onglets)
- **Panel auto-ouvert** : s'ouvre par défaut sur l'onglet Affichage avec animation slide-in (150ms delay + translate-x 300ms)

### Modale NewListModal

- Redesign pour matcher le design system (SessionFinishModal style)

### Fichiers modifiés

| Fichier | Nature |
|---------|--------|
| `src/components/tachistoscope/SidePanel.tsx` | Refonte majeure (tabs, display mode, contraste, image guard) |
| `src/components/FilterPanel.tsx` | Nouveau câblage filtres live, réorg sections |
| `src/components/filters/SearchFilter.tsx` | Pattern de référence (inchangé) |
| `src/components/filters/GraphemeFilter.tsx` | Input contrôlé + callback live `onGraphemeUpdate` |
| `src/components/filters/PhonemeFilter.tsx` | Sélection contrôlée + callback live `onPhonemesUpdate` |
| `src/components/filters/FilterGroup.tsx` | Dividers violet unifié |
| `src/components/SelectionTray.tsx` | Items enrichis (catégorie, syllabes, image) |
| `src/types/word.ts` | +`realtimeGrapheme`, +`realtimePhonemes` dans `WordFilters` |
| `src/hooks/useWords.ts` | Logique de filtrage temps réel graphème/phonème |
| `src/contexts/PlayerContext.tsx` | Default `panelMode: 'config'`, `isPanelOpen: false` |
| `src/data/phonemes.ts` | Fix Unicode `ɔ̃` → `õ` |

### Architecture technique

- **Display mode decomposition** : l'UI décompose `displayMode` en `contentMode` (word/image/both) + `isDoubleFace` (bool), puis recompose la valeur interne — zéro breaking change sur le stockage/contexte
- **Dual-mode filtering** : `realtimeSearch`/`realtimeGrapheme`/`realtimePhonemes` (live keystroke/click) coexistent avec les tags persistants (AND logic)
- **Image detection** : `queue.some(w => w["image associée"]?.trim())` pour toggle, `queue.filter(...)` pour comptage mixte

### Design system

- Violet principal : `#6C5CE7`
- Titres : Sora (font-sora)
- Corps : DM Sans (font-dm-sans)
- Texte dark : `#1A1A2E`
- Texte secondaire : `#6B7280`
- Texte muted : `#9CA3AF`
