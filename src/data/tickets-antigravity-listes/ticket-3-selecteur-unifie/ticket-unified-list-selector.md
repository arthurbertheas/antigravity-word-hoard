# 🎫 Ticket : Refonte du sélecteur de liste dans le panneau "Ma Liste"

## Contexte

Actuellement, le panneau "Ma Liste" contient deux éléments séparés pour gérer les listes :
1. Un bouton "Mes listes" qui ouvre le panneau de sélection
2. Un élément séparé en dessous qui affiche la liste sélectionnée

**Problèmes identifiés :**
- Duplication visuelle (deux éléments pour la même information)
- Impossibilité de désélectionner une liste une fois choisie
- Flux utilisateur confus

---

## Objectif

Fusionner ces deux éléments en **un seul composant unifié** qui :
- Affiche l'état actuel (aucune liste / liste sélectionnée)
- Permet d'ouvrir le panneau de sélection des listes
- Permet de **désélectionner** la liste active

---

## Spécifications fonctionnelles

### État 1 : Aucune liste sélectionnée

```
┌─────────────────────────────────────────┐
│ 📂  Liste de travail               [>]  │
│     Aucune liste                        │
└─────────────────────────────────────────┘
```

- Icône : dossier gris (`📂`)
- Label : "Liste de travail" (petit, gris)
- Valeur : "Aucune liste"
- Action : clic → ouvre la vue "Mes listes"

---

### État 2 : Liste sélectionnée

```
┌─────────────────────────────────────────┐
│ 📋  !!!! fd                   [✕]  [>]  │
│     Phonologie                          │
└─────────────────────────────────────────┘
```

- Icône : liste avec fond violet (`📋`)
- Valeur : nom de la liste (ex: "!!!! fd")
- Tags : affichés en dessous (ex: "Phonologie")
- Bordure : violette (`#6366f1`)
- Fond : léger dégradé violet
- **Bouton ✕** : désélectionne la liste (action directe, sans confirmation)
- **Bouton >** : ouvre la vue "Mes listes"

---

### Vue "Mes listes" (panneau ouvert)

```
┌─────────────────────────────────────────┐
│ [<]  Mes listes                         │
│      23 listes sauvegardées             │
├─────────────────────────────────────────┤
│ 🔍 Rechercher...                        │
├─────────────────────────────────────────┤
│ ✕  Désélectionner la liste              │  ← Nouveau (si liste active)
├─────────────────────────────────────────┤
│ ▌!!!! fd              7   •••           │  ← Sélectionnée (highlight)
│   !!!!                9   •••           │
│   Mots à retrav...    1   •••           │
│   ...                                   │
├─────────────────────────────────────────┤
│      [ + Nouvelle liste ]               │
└─────────────────────────────────────────┘
```

**Nouveautés :**
1. **Option "Désélectionner la liste"** en haut de la liste (visible uniquement si une liste est sélectionnée)
2. **Bouton "Nouvelle liste"** toujours visible en bas

---

## Comportement du bouton "Nouvelle liste"

**Si des mots sont en cours de sélection**, afficher une modale :

```
┌─────────────────────────────────────────────┐
│                                             │
│   Créer une nouvelle liste                  │
│   Vous avez 12 mots en cours de sélection   │
│                                             │
│   ○ Sauvegarder dans la nouvelle liste      │
│     Les 12 mots seront ajoutés à la liste   │
│                                             │
│   ○ Conserver les mots en cours             │
│     Créer une liste vide, je sauvegarde     │
│     plus tard                               │
│                                             │
│   ○ Abandonner les mots                     │
│     Vider la sélection et créer une liste   │
│     vide                                    │
│                                             │
│              [Annuler]  [Continuer]         │
│                                             │
└─────────────────────────────────────────────┘
```

**Si aucun mot en cours**, créer directement une nouvelle liste vide.

---

## Spécifications techniques

### Composant unifié : `ListSelectorUnified`

| Prop | Type | Description |
|------|------|-------------|
| `selectedList` | `List \| null` | Liste actuellement sélectionnée |
| `onOpenListView` | `() => void` | Ouvre le panneau "Mes listes" |
| `onDeselect` | `() => void` | Désélectionne la liste active |

### Classes CSS suggérées

```css
.list-selector-unified { }
.list-selector-unified.has-selection { }
.selector-icon-box { }
.selector-btn.deselect { }
```

### États visuels

| État | Bordure | Fond | Icône |
|------|---------|------|-------|
| Sans sélection | `#e8ebf2` | `white` | Gris |
| Avec sélection | `#6366f1` | Dégradé violet léger | Violet |
| Hover | `#d0d4e0` | — | — |

---

## Critères d'acceptance

- [ ] L'élément "Mes listes" et l'affichage de la sélection sont fusionnés en un seul composant
- [ ] Le bouton ✕ permet de désélectionner une liste (visible uniquement si liste active)
- [ ] L'option "Désélectionner la liste" apparaît en haut de la vue liste (si liste active)
- [ ] Le bouton "Nouvelle liste" est visible en bas de la vue liste
- [ ] La modale de gestion des mots s'affiche si des mots sont en cours lors de la création d'une nouvelle liste
- [ ] Les états visuels (bordure, fond, icône) reflètent correctement l'état de sélection

---

## Ressources

- **Mockup interactif** : `side-panel-selector-v2.jsx` (fichier joint)
- **Figma / Screenshots** : [à compléter si disponible]

---

## Priorité

🟡 Medium

## Estimation

~4-6h de développement

---

## Notes

- Ce ticket ne couvre pas le mobile (desktop prioritaire)
- Le panneau latéral existant est conservé, seul le composant de sélection change
