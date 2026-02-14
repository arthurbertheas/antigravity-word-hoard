# Antigravity Word Hoard - Design System

## Direction

**Personnalité:** Précision Éducative & Clarté Thérapeutique
**Fondation:** Violet professionnel (indigo)
**Profondeur:** Borders-only avec accents de couleur subtils
**Public:** Orthophonistes professionnels gérant des ressources thérapeutiques

## Philosophie

Une interface qui inspire confiance professionnelle tout en restant accessible. 
Les couleurs violettes apportent de la personnalité sans compromettre le sérieux clinique.
La hiérarchie visuelle guide l'orthophoniste rapidement vers l'action appropriée.

---

## Tokens

### Couleurs de Base

#### Primaires
```css
--primary: #4f46e5           /* Indigo principal - actions primaires */
--primary-hover: #4338ca     /* Hover state */
--primary-active: #3730a3    /* Active state */
```

#### Surfaces
```css
--background: #ffffff        /* Surface de base */
--surface-1: #fafafa         /* Élévation 1 (cards) */
--surface-2: #f5f5f5         /* Élévation 2 (modals) */
--surface-3: #f0f0f0         /* Élévation 3 (dropdowns) */
```

#### Texte
```css
--text-primary: #1e293b      /* Texte principal (slate-900) */
--text-secondary: #475569    /* Texte secondaire (slate-600) */
--text-tertiary: #94a3b8     /* Texte tertiaire (slate-400) */
--text-muted: #cbd5e1        /* Texte désactivé (slate-300) */
```

#### Bordures
```css
--border-default: #e2e8f0    /* Bordure standard (slate-200) */
--border-soft: #f1f5f9       /* Bordure douce (slate-100) */
--border-emphasis: #cbd5e1   /* Bordure emphase (slate-300) */
```

#### Accent Backgrounds
```css
--accent-bg: #eef2ff         /* Background violet clair pour icônes */
--accent-subtle: #f9fafb     /* Background très subtil */
```

#### États Sémantiques
```css
--success: #10b981           /* Succès (green-500) */
--warning: #f59e0b           /* Avertissement (amber-500) */
--error: #ef4444             /* Erreur (red-500) */
--info: #3b82f6              /* Information (blue-500) */
```

### Typographie

#### Familles
- **Headings & Labels:** Sora (sans-serif, geometric)
- **Body & Paragraphs:** DM Sans (sans-serif, readable)
- **Code & Data:** IBM Plex Mono (monospace)

#### Échelle
```css
--text-xs: 11px              /* Labels, caps */
--text-sm: 13px              /* Supporting text */
--text-base: 15px            /* Body default */
--text-lg: 17px              /* Emphasized body */
--text-xl: 20px              /* Small headings */
--text-2xl: 24px             /* Section headings */
--text-3xl: 30px             /* Page headings */
```

#### Poids
```css
--font-normal: 400           /* Body text */
--font-medium: 500           /* Labels, navigation */
--font-semibold: 600         /* Headings, emphasis */
--font-bold: 700             /* Strong emphasis */
```

### Espacement

#### Base
```css
--spacing-base: 4px          /* Unité de base */
```

#### Échelle
```css
--spacing-1: 4px             /* Micro spacing (icon gaps) */
--spacing-2: 8px             /* Small spacing */
--spacing-3: 12px            /* Component internal */
--spacing-4: 16px            /* Component default */
--spacing-5: 20px            /* Component generous */
--spacing-6: 24px            /* Section spacing */
--spacing-8: 32px            /* Major separation */
--spacing-10: 40px           /* Page sections */
--spacing-12: 48px           /* Large sections */
```

### Border Radius

```css
--radius-sm: 4px             /* Small elements (badges, tags) */
--radius-md: 6px             /* Buttons, inputs */
--radius-lg: 8px             /* Cards, panels */
--radius-xl: 12px            /* Modals, major containers */
--radius-full: 9999px        /* Pills, circular elements */
```

### Profondeur (Depth)

**Stratégie:** Borders-only avec surfaces légèrement élevées

```css
--shadow-none: none
--border-card: 1px solid var(--border-default)
--border-panel: 1px solid var(--border-soft)
--border-input: 1px solid var(--border-default)
--border-input-focus: 2px solid var(--primary)
```

**Note:** Pas d'ombres portées dramatiques. La hiérarchie est créée par :
- Bordures subtiles
- Changements de couleur de surface
- Espacement généreux

---

## Patterns de Composants

### Boutons

#### Bouton Principal (Primary)
```
Hauteur: 36px
Padding: 12px 16px
Radius: var(--radius-md) (6px)
Font: Sora, 13px, medium (500)
Color: white
Background: var(--primary)
Border: none

Hover: background → var(--primary-hover)
Active: background → var(--primary-active)
Focus: outline 2px var(--primary) offset 2px
Disabled: opacity 0.5, cursor not-allowed
```

#### Bouton Secondaire (Secondary)
```
Hauteur: 36px
Padding: 12px 16px
Radius: var(--radius-md)
Font: Sora, 13px, medium
Color: var(--text-primary)
Background: transparent
Border: 1px solid var(--border-default)

Hover: background → var(--surface-1)
Active: background → var(--surface-2)
```

#### Bouton Ghost
```
Hauteur: 36px
Padding: 12px 16px
Radius: var(--radius-md)
Font: Sora, 13px, medium
Color: var(--text-secondary)
Background: transparent
Border: none

Hover: background → var(--accent-subtle)
Active: background → var(--accent-bg)
```

### Cartes (Cards)

#### Carte Standard
```
Background: var(--surface-1)
Border: var(--border-card)
Radius: var(--radius-lg) (8px)
Padding: var(--spacing-4) (16px)

Shadow: none (borders-only approach)
```

#### Carte Interactive (Hover)
```
Hérite de Carte Standard
Cursor: pointer

Hover: 
  - border-color → var(--border-emphasis)
  - background → var(--background) (légèrement plus clair)
Transition: all 150ms ease
```

### Inputs

#### Input Standard
```
Hauteur: 40px
Padding: 10px 12px
Radius: var(--radius-md)
Font: DM Sans, 15px, normal
Color: var(--text-primary)
Background: var(--background)
Border: var(--border-input)

Placeholder: var(--text-tertiary)

Focus:
  - border → var(--border-input-focus)
  - outline → none
  
Disabled:
  - background → var(--surface-1)
  - color → var(--text-muted)
  - cursor → not-allowed
```

#### Input avec Icône
```
Hérite de Input Standard
Padding-left: 40px (pour icône 20px à gauche)

Icône:
  - Position: absolute, left 12px
  - Size: 20px
  - Color: var(--text-tertiary)
```

### Icônes

#### Icône Standalone avec Container
```
Container:
  - Width/Height: 28px
  - Radius: var(--radius-lg) (8px)
  - Background: var(--accent-bg)
  - Padding: 6px

Icône:
  - Size: 16px (inside 28px container)
  - Color: var(--primary)
```

#### Icône Inline
```
Size: 16px-20px selon contexte
Color: hérite du texte parent
Vertical-align: middle
```

### Labels & Tags

#### Label Caps (Filtres, Sections)
```
Font: Sora, 11px, semibold (600)
Text-transform: uppercase
Letter-spacing: 0.5px
Color: var(--text-secondary)
```

#### Tag/Badge
```
Padding: 4px 8px
Radius: var(--radius-sm) (4px)
Font: DM Sans, 12px, medium
Background: var(--accent-bg)
Color: var(--primary)
Border: none
```

### Switch/Toggle

```
Width: 44px (11 × 4px)
Height: 24px (6 × 4px)
Radius: var(--radius-full)

Track:
  - Background: var(--border-default) (off)
  - Background: var(--primary) (on)

Thumb:
  - Size: 20px
  - Background: white
  - Shadow: 0 1px 3px rgba(0,0,0,0.1)
  - Transition: transform 200ms ease

States:
  - Off: transform translateX(2px)
  - On: transform translateX(22px)
```

### Modals

#### Modal Container
```
Background: var(--surface-2)
Border: var(--border-card)
Radius: var(--radius-xl) (12px)
Padding: var(--spacing-6) (24px)
Max-width: 600px (ou selon contenu)

Shadow: none (borders-only)
```

#### Modal Overlay
```
Background: rgba(0, 0, 0, 0.5)
Backdrop-filter: blur(4px)
```

### Panels/Sidebars

#### Filter Panel
```
Background: var(--background)
Border-right: 1px solid var(--border-default)
Padding: var(--spacing-4)
Width: 280px (ou fixe selon design)

Section Spacing: var(--spacing-6) entre groupes
```

---

## Layouts Spécifiques

### FilterSection (Antigravity)
```
Groupe de filtres:
  - Spacing entre groupes: var(--spacing-6) (24px)
  - Label groupe: Font Sora 11px caps semibold
  - Spacing après label: var(--spacing-3) (12px)
```

### FilterGroup (Antigravity)
```
Disposition des switches/options:
  - Gap vertical: var(--spacing-2) (8px)
  - Label switch: DM Sans 15px normal
  - Switch alignment: space-between avec gap
```

### WordCard
```
Structure interne adaptée au contenu:
  - Header: mot principal
  - Body: phonèmes, graphèmes, métadonnées
  - Footer: actions

Padding interne cohérent avec patterns Carte Standard
```

---

## États d'Interaction

### Hover
```
Transition: 150ms ease
Changes: background, border-color, transform légères
```

### Focus
```
Outline: 2px solid var(--primary)
Outline-offset: 2px
Border-radius: hérite du composant
```

### Active
```
Transform: scale(0.98) pour boutons
Background: teinte plus foncée
```

### Disabled
```
Opacity: 0.5
Cursor: not-allowed
Pointer-events: none
```

### Loading
```
Opacity: 0.7
Cursor: wait
Animation: pulse subtile ou spinner
```

### Error
```
Border: 2px solid var(--error)
Background: rgba(239, 68, 68, 0.05)
Color message: var(--error)
```

---

## Navigation & Context

### Header Principal
```
Height: 64px
Background: var(--background)
Border-bottom: 1px solid var(--border-default)
Padding: 0 var(--spacing-6)

Content:
  - Logo/Titre: left
  - Navigation: center
  - User/Actions: right
```

### Sidebar Navigation
```
Width: 240px
Background: var(--background) (même que main)
Border-right: 1px solid var(--border-default)
Padding: var(--spacing-4)

Items:
  - Height: 40px
  - Padding: var(--spacing-3) var(--spacing-4)
  - Radius: var(--radius-md)
  - Gap (icon-text): var(--spacing-2)
  
  Active:
    - Background: var(--accent-bg)
    - Color: var(--primary)
    - Font-weight: medium
    
  Hover:
    - Background: var(--accent-subtle)
```

---

## Animations

### Micro-interactions
```
Duration: 150ms
Easing: ease ou cubic-bezier(0.4, 0, 0.2, 1)
Properties: background, border-color, transform, opacity
```

### Modal/Panel Enter
```
Duration: 200ms
Easing: cubic-bezier(0.16, 1, 0.3, 1) (deceleration)
Transform: scale(0.95) → scale(1) ou translateY(10px) → 0
Opacity: 0 → 1
```

### Modal/Panel Exit
```
Duration: 150ms
Easing: cubic-bezier(0.4, 0, 1, 1) (acceleration)
Transform: inverse de enter
Opacity: 1 → 0
```

### Confetti (Special)
```
Utilise canvas-confetti library
Trigger: sur validation de formulaire, succès d'action
Colors: basées sur var(--primary) et variantes
Duration: 2000ms
```

---

## Dark Mode (Future)

*Note: Antigravity est actuellement en mode clair uniquement*

Quand dark mode sera implémenté :

```css
/* Dark Mode Surfaces */
--background-dark: #0f172a           /* slate-900 */
--surface-1-dark: #1e293b            /* slate-800 */
--surface-2-dark: #334155            /* slate-700 */

/* Dark Mode Text */
--text-primary-dark: #f1f5f9         /* slate-100 */
--text-secondary-dark: #cbd5e1       /* slate-300 */

/* Dark Mode Borders */
--border-default-dark: rgba(255,255,255,0.1)
--border-emphasis-dark: rgba(255,255,255,0.2)

/* Primary reste identique */
--primary: #4f46e5 (ajusté si nécessaire)
```

---

## Règles de Cohérence

### ✅ À Faire

- Utiliser systématiquement l'échelle d'espacement (4px base)
- Appliquer borders-only pour la profondeur
- Respecter les hauteurs de boutons/inputs (36px/40px)
- Utiliser Sora pour labels caps, DM Sans pour body
- Maintenir les radius cohérents par type de composant
- Appliquer les états (hover, focus, disabled) partout

### ❌ À Éviter

- Valeurs d'espacement hors échelle (ex: 15px, 22px)
- Ombres portées dramatiques (sauf exceptions spéciales)
- Mix de stratégies de profondeur
- Radius incohérents sur composants similaires
- États manquants sur éléments interactifs
- Couleurs hors palette définie

---

## Notes Spécifiques Antigravity

### Export PDF Imagier
- Utiliser tokens de couleur et espacement
- Maintenir cohérence visuelle même dans PDF
- Headers, grids, et labels suivent system.md

### Filtres Phonèmes/Graphèmes
- FilterSection et FilterGroup appliquent spacing cohérent
- Switch width/height respectent tokens (11px → 44px, 6px → 24px)
- Labels suivent Sora 11px caps

### Slideshow Mode
- Controls suivent patterns boutons
- Transitions respectent animation tokens
- Navigation maintient cohérence visuelle

---

## Évolution du Système

Ce document est vivant. Quand de nouveaux patterns émergent :

1. Vérifier cohérence avec principes existants
2. Documenter dimensions, couleurs, comportements
3. Ajouter à la section Patterns appropriée
4. Référencer dans code pour réutilisation

---

**Dernière mise à jour:** Février 2026
**Maintainers:** Arthuro & Manon
**Projet:** Ressources Orthophonie - Antigravity Word Hoard
