# Design : Imagier Phonétique

## Concept

Outil standalone de création de planches imprimables A4 avec des cartes image + mot.
Destiné aux orthophonistes pour préparer du matériel de rééducation à imprimer/découper.

**Ce n'est PAS un diaporama** — c'est un outil d'impression. Pas de lecture assistée,
pas de colorisation phonème, pas d'arcs syllabiques.

## Intégration dans l'app

Overlay plein écran, même pattern que le Tachistoscope :

```
WordExplorer
  ├─ FilterPanel
  ├─ WordBank
  ├─ SelectionTray
  │    ├─ "Exporter la liste"
  │    ├─ "Créer un imagier" ← NOUVEAU
  │    └─ "Lancer le diaporama"
  ├─ Tachistoscope (overlay)
  └─ Imagier (overlay) ← NOUVEAU
```

- Bouton dans SelectionTray (icône ImageIcon, déjà importée)
- State `isImagierOpen` dans WordExplorer ou SelectionContext
- Composant `<Imagier words={selectedWords} isOpen={isImagierOpen} onClose={...} />`
- Pas de nouvelle route

## Structure UI

Panel latéral 440px + zone de preview A4 live.

### Topbar
- Bouton retour (fermer l'overlay)
- Titre "Imagier phonétique"
- Badge compteur d'images
- Badge format (Aperçu A4 portrait/paysage)
- Bouton "Imprimer" (principal)

### Panel — 3 onglets

**Onglet "Mise en page"**

| Option | Type | Valeurs |
|--------|------|---------|
| Grille | Cartes visuelles | 2×3, 3×3, 3×4, 4×4 |
| Orientation | Boutons radio visuels | Portrait, Paysage |
| Titre | Input texte | Libre (header de la page imprimée) |
| Sous-titre | Input texte | Libre |
| Traits de découpe | Toggle | On/Off (pointillés entre cartes) |

**Onglet "Contenu"**

| Option | Type | Source données |
|--------|------|----------------|
| Mot | Toggle | `word.MOTS` |
| Déterminant | Toggle | Mapping SYNT → déterminant |
| Casse | Radio inline | minuscule / MAJUSCULE / Capitalisé |
| Taille police | Radio inline | S / M / L |
| Segmentation syllabique | Toggle | `word["segmentation syllabique"]` |
| Transcription phonétique | Toggle | `word.PHONEMES` (nettoyé en /.../) |
| Catégorie syntaxique | Toggle badge | `word.SYNT` |
| Nombre de syllabes | Toggle badge | `word.NBSYLL` |

**Onglet "Ordre"**
- Drag & drop sur la grille (HTML5 DnD API)
- Liste réordonnable des mots

### Zone de preview
- Page A4 proportionnelle (centrée, ombre paper)
- Grille de cartes avec image + infos selon toggles
- Navigation multi-pages (prev/next + indicateur)

## Données utilisées

Tout vient du JSON existant, pas de donnée supplémentaire :

```typescript
interface Word {
  MOTS: string;                        // → mot affiché
  PHONEMES: string;                    // → transcription phonétique
  "segmentation syllabique": string;   // → découpage syllabique
  SYNT: string;                        // → catégorie (NC, V, ADJ...)
  NBSYLL: string;                      // → nombre de syllabes
  "image associée": string;            // → URL image SVG Supabase
}
```

## Gestion des images

- Seuls les mots avec `image associée` non vide sont inclus dans l'imagier
- Warning ambre si des mots ont été retirés : "X mot(s) sans image ont été retirés"
- Le bouton "Créer un imagier" est disabled si aucun mot sélectionné n'a d'image

## Impression

- `window.print()` avec `@media print` CSS
- Le panel se masque, seule la grille A4 s'imprime
- Support multi-pages via CSS `page-break`

## Features explicitement exclues (validé)

- Colorisation phonème cible (feature diaporama)
- Lettres muettes (feature diaporama)
- Arcs syllabiques (trop petit sur carte imprimée)
- Bordures Montessori (pas pratique ortho)
- Cases vides (pas de besoin réel)
- Recto-verso (complexité v2)

## Référence

Mockup HTML : `mockup-imagier.html` (v5 clean)
