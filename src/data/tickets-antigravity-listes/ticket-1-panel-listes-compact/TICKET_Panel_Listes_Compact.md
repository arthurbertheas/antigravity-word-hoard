# 📋 Ticket : Refonte du panel "Mes listes" — Design compact + Actions Modifier/Supprimer

**Priorité :** Haute
**Estimation :** 5–6h
**Type :** Feature / UI
**Labels :** `ma-liste`, `ui`, `panel`, `saved-lists`

---

## 📋 Contexte

Le panel "Mes listes sauvegardées" pose deux problèmes :

1. **Densité insuffisante** : le design actuel en cards (4 lignes d'info par liste) ne permet de voir que ~4 listes sans scroller. Avec une moyenne de 20 listes par orthophoniste, l'utilisateur doit scroller beaucoup pour retrouver une liste.
2. **Actions manquantes** : il n'existe aucun moyen de modifier ou supprimer une liste sauvegardée depuis le panel.

---

## 🎯 Objectif

- Passer d'un design **cards** à un design **rows compactes** (~50px par ligne vs ~110px) pour afficher ~10 listes visibles sans scroll
- Ajouter un **menu ⋯** sur chaque row avec les actions Modifier et Supprimer
- Le **clic sur la row** charge la liste (comportement existant)
- Le **clic sur ⋯** ouvre le menu d'actions (indépendant de la sélection)

---

## ✅ Changements à apporter

### 1. Remplacer les cards par des rows compactes

**Avant (card ~110px) :**
```
┌────────────────────────────────────────┐
│ Mots à retravailler — 39/02   3 mots  │
│ Aujourd'hui à 21h03                    │
│ [ratés] [CP]                           │
│ clocheton, minerve, muscat             │
└────────────────────────────────────────┘
```

**Après (row ~50px) :**
```
┌────────────────────────────────────────────┐
│ Mots à retravailler — 39/02     3   ⋯  │
│ Auj. 21h03 · [ratés] [CP]                 │
└────────────────────────────────────────────┘
```

### 2. Structure d'une row compacte

```
┌─────────────────────────────────────────────┐
│  [Nom de la liste ...]            [3] [⋯]  │
│  Auj. 21h03 · [tag1] [tag2] +1             │
└─────────────────────────────────────────────┘
```

**Ligne 1 :** Nom (ellipsis si trop long) + badge compteur + bouton ⋯
**Ligne 2 :** Date abrégée · séparateur point · tags (max 2 affichés) + "+X" si plus

---

### 3. Specs visuelles de la row

**Conteneur :**

| Propriété | Normal | Hover | Sélectionné (chargée) |
|-----------|--------|-------|----------------------|
| Padding | `9px 12px` | — | — |
| Border-radius | 12px | — | — |
| Border | `1px solid transparent` | — | `1.5px solid #6C5CE7` |
| Background | transparent | `#F8F9FC` | `rgba(108, 92, 231, 0.03)` |

**Nom :**

| Propriété | Valeur |
|-----------|--------|
| Font | Sora 13px 600 |
| Couleur | `#1A1A2E` (normal) / `#6C5CE7` (sélectionné) |
| Overflow | `ellipsis`, `nowrap` |

**Date abrégée :**

| Propriété | Valeur |
|-----------|--------|
| Font | DM Sans 11px 400 |
| Couleur | `#B0B5C0` |
| Format | `Auj. HHhMM` / `Hier HHhMM` / `JJ/MM` |

```typescript
function formatDateCompact(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const time = `${String(date.getHours()).padStart(2, '0')}h${String(date.getMinutes()).padStart(2, '0')}`;
  
  if (date.toDateString() === now.toDateString()) return `Auj. ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Hier ${time}`;
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}
```

**Séparateur :** Point `·` — cercle 3×3px `#D1D5DB` entre date et tags

**Tags :**

| Propriété | Valeur |
|-----------|--------|
| Max affiché | 2 tags |
| Overflow | `+X` en texte gris si > 2 |
| Padding | `1px 7px` |
| Border-radius | 8px |
| Background | `#F0EDFF` (normal) / `rgba(108,92,231,0.08)` (sélectionné) |
| Couleur | `#7C6FD4` |
| Font | DM Sans 10px 500 |

**Badge compteur :**

| Propriété | Valeur |
|-----------|--------|
| Font | IBM Plex Mono 11px 600 |
| Couleur | `#6B7280` (normal) / `#6C5CE7` (sélectionné) |
| Background | `#F3F4F6` (normal) / `rgba(108,92,231,0.08)` (sélectionné) |
| Padding | `2px 7px` |
| Border-radius | 6px |
| Contenu | Nombre seul (ex: `3`, pas `3 mots`) |

**Bouton ⋯ :**

| Propriété | Valeur |
|-----------|--------|
| Taille | 26×26px |
| Border-radius | 7px |
| Border | none |
| Background | transparent (normal) / `#F3F4F6` (hover) / `#F0EDFF` (ouvert) |
| Couleur | `#C4C4C4` (normal) / `#9CA3AF` (hover) / `#6C5CE7` (ouvert) |
| Icône | 3 points horizontaux, 14×14px |

---

### 4. Menu dropdown au clic sur ⋯

**Positionnement :** `position: fixed` par rapport au viewport (pas relative à la card) pour éviter les problèmes de superposition avec le scroll.

```typescript
// Calculer la position à partir du bouton ⋯
const rect = dotsButton.getBoundingClientRect();
const menuPos = {
  top: rect.bottom + 4,
  right: window.innerWidth - rect.right,
};
```

**Style du dropdown :**

| Propriété | Valeur |
|-----------|--------|
| Width | 170px |
| Background | `rgba(255,255,255,0.97)` |
| Backdrop-filter | `blur(16px)` |
| Border-radius | 14px |
| Border | `1px solid rgba(0,0,0,0.06)` |
| Shadow | `0 10px 36px rgba(0,0,0,0.12)` |
| Animation | scale 0.92→1 + translateY -4→0, 0.18s spring |

**Items du menu :**

| Action | Icône bg | Icône couleur | Texte couleur | Hover bg |
|--------|----------|---------------|---------------|----------|
| **Modifier** | `#F0EDFF` | `#6C5CE7` | `#374151` | `#F8F9FC` |
| **Supprimer** | `#FEE2E2` | `#EF4444` | `#EF4444` | `#FEF2F2` |

Chaque item : icône dans un carré 28×28px border-radius 8px + label DM Sans 13px 500. Padding `9px 12px`.

**Fermeture :** Clic en dehors du menu, ou clic sur un item.

---

### 5. Clic sur la row → Charger la liste

Comportement inchangé par rapport à l'existant :

```typescript
const handleLoad = (list) => {
  loadListIntoPanel(list.words);  // Charge les mots dans Ma Liste
  navigateBack();                  // Retour au panel Ma Liste
};
```

Le `stopPropagation` sur le bouton ⋯ empêche le chargement quand on clique sur le menu.

---

### 6. Action "Supprimer" → Modale de confirmation

**Design :**

```
┌──────────────────────────────────────┐
│            🗑️ (shake)                │
│                                      │
│    Supprimer cette liste ?           │
│                                      │
│   "Mots à retravailler — 39/02"     │
│    sera définitivement supprimée.    │
│                                      │
│    [Annuler]    [Supprimer]          │
└──────────────────────────────────────┘
```

| Élément | Specs |
|---------|-------|
| Overlay | `rgba(15,20,35,0.45)` + blur 6px |
| Modale | 380px, border-radius 22px, padding 28px |
| Icône | 52×52px, border-radius 16px, gradient `#FEE2E2 → #FECACA`, animation shake 0.5s |
| Titre | Sora 16px bold `#1A1A2E` |
| Nom liste | DM Sans 14px bold `#1A1A2E` entre guillemets |
| Bouton Annuler | border `1.5px solid #E5E7EB`, fond blanc, texte `#6B7280` |
| Bouton Supprimer | gradient `#EF4444 → #DC2626`, texte blanc, shadow rouge |

---

### 7. Action "Modifier" → Modale d'édition

**Design :**

```
┌──────────────────────────────────────────┐
│  ✏️  Modifier la liste              ✕   │
│──────────────────────────────────────────│
│                                          │
│  Nom *                                   │
│  ┌──────────────────────────────┐        │
│  │ Mots à retravailler — 39/02 │ 28/50  │
│  └──────────────────────────────┘        │
│                                          │
│  Description (optionnel)                 │
│  ┌──────────────────────────────┐        │
│  │                              │        │
│  └──────────────────────────────┘        │
│                                          │
│  Étiquettes                              │
│  ┌──────────────────────────────┐        │
│  │ [ratés ×]  Ajouter...       │        │
│  └──────────────────────────────┘        │
│  CP  CE1  CE2  CM1  Phonologie           │
│                                          │
│  Mots (3)                                │
│  ┌──────────────────────────────┐        │
│  │ [clocheton ×] [minerve ×]   │        │
│  │ [muscat ×]                   │        │
│  └──────────────────────────────┘        │
│──────────────────────────────────────────│
│              [Annuler]  [Enregistrer]    │
└──────────────────────────────────────────┘
```

**Champs modifiables :**

| Champ | Type | Max | Requis |
|-------|------|-----|--------|
| Nom | Text input | 50 chars | ✅ |
| Description | Textarea | 200 chars | Non |
| Étiquettes | Tag input + suggestions | 8 tags | Non |
| Mots | Chips supprimables | — | — |

**Comportement des mots :** Chaque mot est un chip avec un bouton `×` pour le retirer de la liste. Pas d'ajout de mots depuis cette modale (l'ajout se fait depuis la grille de sélection).

**Pré-remplissage :** Tous les champs sont pré-remplis avec les données actuelles de la liste.

**Specs modale :** 440px, border-radius 22px. Header avec icône edit violet + titre + bouton ✕. Footer avec Annuler + Enregistrer (disabled si nom vide).

---

### 8. Compteur de résultats

Afficher un compteur au-dessus de la liste quand la recherche est active :

```
12 RÉSULTATS
```

| Propriété | Valeur |
|-----------|--------|
| Font | DM Sans 10px 600 |
| Couleur | `#9CA3AF` |
| Text-transform | uppercase |
| Letter-spacing | 0.06em |
| Padding | `6px 16px 2px` |

---

## 🎬 Animations et transitions

### Row — Hover et sélection

```css
/* Transition sur la row */
.compact-row {
  transition: background 0.15s ease, border-color 0.15s ease;
}
```

Pas de transform sur les rows (pas de `translateY` au hover) — on veut rester stable avec 20 items.

### Bouton ⋯ — États

```css
.dots-button {
  transition: all 0.12s ease;
}
```

| État | Background | Couleur |
|------|-----------|---------|
| Normal | `transparent` | `#C4C4C4` |
| Hover | `#F3F4F6` | `#9CA3AF` |
| Ouvert | `#F0EDFF` | `#6C5CE7` |

### Dropdown menu — Apparition

```css
@keyframes menuPop {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dropdown-menu {
  animation: menuPop 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

- **Durée :** 180ms
- **Easing :** spring `cubic-bezier(0.34, 1.56, 0.64, 1)` — léger overshoot pour un effet rebond subtil
- **Fermeture :** disparition immédiate (pas d'animation de sortie, ça ralentit l'interaction)

### Items du dropdown — Hover

```css
.dropdown-item {
  transition: background 0.1s ease;
}
```

Pas de transform ni d'animation sur les items individuels — seul le fond change au hover.

### Overlay des modales — Apparition

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-overlay {
  animation: fadeIn 0.2s ease;
}
```

### Modale — Entrée

```css
@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal {
  animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

- **Durée :** 300ms
- **Easing :** même spring que le dropdown
- **Scale de départ :** 0.94 (léger zoom-in)
- **TranslateY :** 8px (vient du bas)

### Icône poubelle — Shake (modale supprimer uniquement)

```css
@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-8deg); }
  40% { transform: rotate(8deg); }
  60% { transform: rotate(-4deg); }
  80% { transform: rotate(4deg); }
}

.delete-icon {
  animation: shake 0.5s ease 0.15s; /* delay 150ms pour laisser la modale s'ouvrir */
}
```

### Toast — Apparition et disparition

```css
@keyframes toastIn {
  from {
    opacity: 0;
    transform: translate(-50%, 8px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.toast {
  animation: toastIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

- **Position :** fixed, `bottom: 24px`, `left: 50%`, `transform: translateX(-50%)`
- **Durée d'affichage :** 2200ms puis disparition (JS `setTimeout`)
- **Pas d'animation de sortie** — le toast est simplement retiré du DOM

### Récapitulatif des timings

| Élément | Durée | Easing | Delay |
|---------|-------|--------|-------|
| Row hover | 150ms | ease | — |
| Bouton ⋯ | 120ms | ease | — |
| Dropdown apparition | 180ms | spring | — |
| Dropdown fermeture | 0ms | — | — |
| Dropdown item hover | 100ms | ease | — |
| Overlay apparition | 200ms | ease | — |
| Modale apparition | 300ms | spring | — |
| Icône shake | 500ms | ease | 150ms |
| Toast apparition | 250ms | spring | — |
| Toast durée | 2200ms | — | — |

---



```typescript
// Structure d'une row compacte
interface CompactRowProps {
  list: SavedList;
  isLoaded: boolean;           // true si cette liste est chargée dans Ma Liste
  onLoad: (list) => void;      // Clic sur la row
  onEdit: (list) => void;      // Menu → Modifier
  onDelete: (list) => void;    // Menu → Supprimer
}

// Le menu utilise position: fixed pour éviter les problèmes de z-index/overflow
// Le bouton ⋯ passe sa ref au menu pour calculer la position
const dotsRef = useRef(null);
const rect = dotsRef.current.getBoundingClientRect();
```

---

## 🧪 Critères d'acceptation

**Design compact :**
- [ ] Chaque row fait ~50px de hauteur (2 lignes d'info)
- [ ] Le nom est en Sora 13px bold, ellipsis si trop long
- [ ] La date est abrégée (Auj., Hier, ou JJ/MM)
- [ ] Max 2 tags affichés + "+X" si plus
- [ ] Le badge compteur affiche le nombre seul (pas "X mots")
- [ ] ~10 listes visibles sans scroller dans le panel

**Clic sur la row :**
- [ ] Charge la liste dans Ma Liste
- [ ] La row sélectionnée a une bordure violette
- [ ] Le clic ne se déclenche pas quand on clique sur ⋯

**Menu ⋯ :**
- [ ] Le bouton ⋯ est visible sur chaque row (pas seulement la sélectionnée)
- [ ] Le dropdown s'ouvre en position fixe, au-dessus de tout contenu
- [ ] Le dropdown ne se fait pas couper par le scroll du panel
- [ ] Le menu contient Modifier et Supprimer
- [ ] Clic en dehors ferme le menu

**Supprimer :**
- [ ] Modale de confirmation avec nom de la liste
- [ ] L'icône poubelle fait un shake à l'ouverture
- [ ] Annuler ferme la modale sans action
- [ ] Supprimer retire la liste et ferme la modale
- [ ] Si la liste supprimée était chargée, Ma Liste se vide
- [ ] Toast de confirmation après suppression

**Modifier :**
- [ ] Modale pré-remplie avec les données actuelles
- [ ] Nom, description, tags, mots sont modifiables
- [ ] Les mots sont supprimables individuellement (chip ×)
- [ ] Les suggestions de tags sont cliquables
- [ ] Enregistrer est disabled si le nom est vide
- [ ] Les changements sont sauvegardés et la liste mise à jour

**Recherche :**
- [ ] Filtre par nom et par tag
- [ ] Le compteur de résultats s'affiche

---

## 📎 Ressources

- `panel-listes-final.jsx` — Maquette du panel avec menu ⋯ et modales (modifier + supprimer)
- `listes-compact-comparison.jsx` — Comparaison cards vs rows compactes

---

**Assigné à :** Lead dev
**Reviewer :** Arthuro
**Sprint :** En cours
