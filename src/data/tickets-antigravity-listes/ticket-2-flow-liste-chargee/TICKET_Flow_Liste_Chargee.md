# 📋 Ticket : Flow de gestion de liste chargée — Panel "Ma Liste"

**Priorité :** Haute
**Estimation :** 4–5h
**Type :** Feature / UI
**Labels :** `ma-liste`, `ui`, `panel`, `save-flow`
**Dépend de :** Ticket "Refonte Panel Mes Listes — Design compact"

---

## 📋 Contexte

Quand un utilisateur charge une liste sauvegardée dans "Ma Liste", le flow actuel est confus :

1. Un bandeau jaune "Liste modifiée" apparaît avec un bouton "Sauvegarder les modifications"
2. Ce bouton ouvre une modale de modification (nom, description, tags) — **alors que l'utilisateur veut juste sauvegarder les changements de mots**
3. Le bouton "Sauvegarder cette liste" en footer reste visible alors que la liste existe déjà
4. L'utilisateur ne sait pas clairement quelle liste est chargée ni comment la gérer

---

## 🎯 Objectif

- Afficher un **bloc informatif** quand une liste est chargée (nom, tags, actions ✏️ et ✕)
- Remplacer le bandeau jaune par un **bouton footer contextuel** qui change selon l'état
- Séparer clairement : **sauvegarder les mots** (action fréquente, 1 clic) vs **modifier les métadonnées** (action rare, modale)
- Gérer 4 états distincts du panel

---

## ✅ Les 4 états du panel

### État 1 — Vide (aucun mot)

```
┌────────────────────────────────────┐
│  Ma Liste                    VIDER │
│────────────────────────────────────│
│  [📁 Mes listes sauvegardées   >] │
│                                    │
│          (icône liste)             │
│    Cliquez sur un mot pour         │
│    l'ajouter à votre liste         │
│                                    │
│────────────────────────────────────│
│  ▶ Lancer la sélection → (grisé)  │
└────────────────────────────────────┘
```

- Pas de bouton save en footer
- CTA "Lancer la sélection" **disabled** (grisé, opacity 0.5)

### État 2 — Mots sélectionnés, pas de liste liée

```
┌────────────────────────────────────┐
│  Ma Liste                    VIDER │
│────────────────────────────────────│
│  [📁 Mes listes sauvegardées   >] │
│                                    │
│  3 mots                            │
│  01 aile                           │
│  02 aide                           │
│  03 agréable                       │
│                                    │
│────────────────────────────────────│
│  💾 Sauvegarder cette liste        │
│  ▶ Lancer la sélection →          │
└────────────────────────────────────┘
```

- Le bouton "💾 Sauvegarder cette liste" apparaît dès qu'il y a ≥ 1 mot
- Ce bouton ouvre la **modale de création** (nom, description, tags)
- CTA "Lancer la sélection" **actif**

### État 3 — Liste chargée, à jour

```
┌────────────────────────────────────┐
│  Ma Liste                    VIDER │
│────────────────────────────────────│
│  [📁 Mes listes sauvegardées   >] │
│  ┌──────────────────────────────┐  │
│  │ 📁 Mots à retravaill... ✏️ ✕│  │
│  │    [ratés] [CP]              │  │
│  └──────────────────────────────┘  │
│  4 mots                            │
│  01 chamelier                      │
│  02 chèvrefeuille                  │
│  ...                               │
│────────────────────────────────────│
│  ▶ Lancer la sélection →          │
└────────────────────────────────────┘
```

- **Bloc de liste chargée** visible (specs ci-dessous)
- **Pas de bouton save** en footer — rien n'a changé
- CTA "Lancer la sélection" seul en footer

### État 4 — Liste chargée, modifiée (mots ajoutés/retirés)

```
┌────────────────────────────────────┐
│  Ma Liste                    VIDER │
│────────────────────────────────────│
│  [📁 Mes listes sauvegardées   >] │
│  ┌──────────────────────────────┐  │
│  │ 📁 Mots à retravaill... ✏️ ✕│  │
│  │    [ratés] [CP]              │  │
│  └──────────────────────────────┘  │
│  7 mots                            │
│  01 chamelier                      │
│  ...                               │
│  05 amour            [AJOUTÉ]      │
│  06 ami              [AJOUTÉ]      │
│────────────────────────────────────│
│  💾 Sauvegarder les modifications  │
│  ▶ Lancer la sélection →          │
└────────────────────────────────────┘
```

- Le bouton footer change de label : **"Sauvegarder les modifications"**
- Ce bouton fait un **save direct** (pas de modale) → spinner → confirmation verte
- Les mots ajoutés depuis la dernière sauvegarde ont un badge **[AJOUTÉ]**

---

## 🔧 Détail des composants

### 1. Bloc de liste chargée

Apparaît entre le bouton "Mes listes" et le compteur de mots quand une liste sauvegardée est chargée.

**Style — neutre (pas violet) :**

| Propriété | Valeur |
|-----------|--------|
| Padding | `9px 11px` |
| Border-radius | 11px |
| Border | `1px solid #E5E7EB` |
| Background | `#F8F9FC` |

**Icône dossier :**

| Propriété | Valeur |
|-----------|--------|
| Conteneur | 30×30px, border-radius 8px |
| Background | `#fff` |
| Border | `1px solid #E5E7EB` |
| Couleur icône | `#6B7280` |

**Nom de la liste :**

| Propriété | Valeur |
|-----------|--------|
| Font | Sora 12px 600 |
| Couleur | `#374151` |
| Overflow | `ellipsis`, `nowrap` |

**Tags :**

| Propriété | Valeur |
|-----------|--------|
| Padding | `1px 6px` |
| Border-radius | 7px |
| Background | `#EEEDF5` |
| Couleur | `#6B7280` |
| Font | DM Sans 10px 500 |

**Bouton ✏️ (modifier) :**

| Propriété | Normal | Hover |
|-----------|--------|-------|
| Taille | 26×26px | — |
| Border-radius | 6px | — |
| Background | transparent | `#F0EDFF` |
| Couleur | `#B0B5C0` | `#6C5CE7` |

→ Au clic : ouvre la **modale de modification** (nom, description, tags)

**Bouton ✕ (détacher) :**

| Propriété | Normal | Hover |
|-----------|--------|-------|
| Taille | 26×26px | — |
| Border-radius | 6px | — |
| Background | transparent | `#FEE2E2` |
| Couleur | `#B0B5C0` | `#EF4444` |

→ Au clic : ouvre la **modale de confirmation de détachement**

---

### 2. Bouton footer contextuel (un seul emplacement)

Le bouton au-dessus de "Lancer la sélection" change selon le contexte :

| Contexte | Visible | Label | Action |
|----------|---------|-------|--------|
| Aucun mot | ❌ Non | — | — |
| Mots, pas de liste liée | ✅ Oui | "Sauvegarder cette liste" | Ouvre modale de création |
| Liste chargée, à jour | ❌ Non | — | — |
| Liste chargée, modifiée | ✅ Oui | "Sauvegarder les modifications" | Save direct (pas de modale) |

**Style du bouton :**

| Propriété | Normal | Hover |
|-----------|--------|-------|
| Padding | `9px 14px` | — |
| Border-radius | 11px | — |
| Border | `1.5px solid #E5E7EB` | `1.5px solid #6C5CE7` |
| Background | `#fff` | `#F8F6FF` |
| Couleur | `#374151` | `#6C5CE7` |
| Font | DM Sans 13px 600 | — |
| Icône | 💾 (save icon) à gauche | — |

**Flow après clic sur "Sauvegarder les modifications" :**

```
[💾 Sauvegarder les modifications]
         ↓ clic
[⏳ Sauvegarde…]  (spinner, fond #F8F9FC, border #E5E7EB, texte #9CA3AF)
         ↓ 600ms
[✓ Sauvegardé]    (fond #E8FBF5, border #A7F3D0, texte #059669)
         ↓ 2500ms
(disparaît — retour à l'état 3)
```

**Spinner :**

```css
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #E5E7EB;
  border-top-color: #6C5CE7;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

---

### 3. Badge "AJOUTÉ" sur les mots nouveaux

Quand une liste est chargée et que des mots sont ajoutés depuis la grille :

| Propriété | Valeur |
|-----------|--------|
| Texte | `AJOUTÉ` |
| Font | 8px 700, letter-spacing 0.02em |
| Couleur | `#6C5CE7` |
| Background | `#F0EDFF` |
| Padding | `1px 5px` |
| Border-radius | 5px |

Le mot row lui-même a un fond légèrement différent :

| Propriété | Mot existant | Mot ajouté |
|-----------|-------------|------------|
| Background | `#fff` | `rgba(108,92,231,0.04)` |
| Border | `1px solid #F3F4F6` | `1px solid #E0DAFB` |

---

### 4. Modale de modification (✏️)

Réutilise la modale existante de modification de liste. Rappel des champs :

| Champ | Type | Max | Requis |
|-------|------|-----|--------|
| Nom de la liste | Text input | 50 chars + compteur | ✅ |
| Description | Textarea | 200 chars + compteur | Non |
| Étiquettes | Tag input + suggestions | 8 tags | Non |
| Aperçu | Chips des mots (lecture seule) | — | — |

**Pré-remplissage :** Tous les champs sont pré-remplis avec les données actuelles.

**CTA :** "Mettre à jour" (violet, disabled si nom vide).

**Après sauvegarde :** Le bloc de liste chargée se met à jour avec le nouveau nom et les nouveaux tags. Toast "✏️ Liste mise à jour".

---

### 5. Modale de détachement (✕)

```
┌──────────────────────────────────────┐
│             ⚠️ (orange)              │
│                                      │
│     Détacher cette liste ?           │
│                                      │
│   "Mots à retravailler — 39/02"     │
│   ne sera plus liée à Ma Liste.     │
│   Les mots resteront dans votre     │
│   sélection actuelle.               │
│                                      │
│    [Annuler]     [Détacher]          │
└──────────────────────────────────────┘
```

| Élément | Specs |
|---------|-------|
| Overlay | `rgba(15,20,35,0.45)` + blur 6px |
| Modale | 380px, border-radius 22px, padding 28px |
| Icône | 52×52px, border-radius 16px, fond `#FEF3C7`, icône ⚠️ orange |
| Titre | Sora 16px bold `#1A1A2E` |
| Nom liste | Bold `#1A1A2E` entre guillemets |
| Description | DM Sans 14px `#6B7280` — "ne sera plus liée... les mots resteront" |
| Bouton Annuler | border `1.5px solid #E5E7EB`, fond blanc, texte `#6B7280` |
| Bouton Détacher | fond `#D97706`, texte blanc, shadow `0 4px 14px rgba(217,119,6,0.25)` |

**Flow après détachement :**

1. Modale se ferme
2. Le bloc de liste slide out (animation 350ms)
3. À sa place : un lien dashed "🔗 Relier à une liste sauvegardée" (optionnel, ouvre le panel Mes Listes)
4. Le footer passe à l'état 2 (bouton "Sauvegarder cette liste" puisqu'il y a des mots mais plus de liste liée)
5. Toast "Liste détachée — les mots sont conservés"

**Animation slide out :**

```css
@keyframes slideOut {
  from { opacity: 1; max-height: 60px; padding: 9px 11px; }
  to { opacity: 0; max-height: 0; padding: 0 11px; }
}
/* Durée: 350ms, easing: ease */
```

---

## 🎬 Animations et transitions

| Élément | Durée | Easing | Delay |
|---------|-------|--------|-------|
| Bouton ✏️ / ✕ hover | 120ms | ease | — |
| Overlay apparition | 200ms | ease | — |
| Modale apparition | 300ms | spring `cubic-bezier(0.34,1.56,0.64,1)` | — |
| Bloc liste slide out (détachement) | 350ms | ease | — |
| Bloc liste fade in (rechargement) | 200ms | ease | — |
| Bouton save spinner | 600ms | linear (infinite) | — |
| Confirmation verte fade in | 200ms | ease | — |
| Confirmation verte durée | 2500ms | — | — |
| Toast | 250ms | spring | — |
| Toast durée | 2500ms | — | — |

---

## 💻 Logique de détection des modifications

```typescript
// Quand une liste est chargée, stocker les mots originaux
const [originalWords, setOriginalWords] = useState<string[]>([]);
const [currentWords, setCurrentWords] = useState<string[]>([]);

// Détecter si des modifications ont été faites
const hasChanges = useMemo(() => {
  if (originalWords.length !== currentWords.length) return true;
  return !originalWords.every((w, i) => w === currentWords[i]);
}, [originalWords, currentWords]);

// Identifier les mots ajoutés (pour le badge AJOUTÉ)
const addedWords = useMemo(() => {
  return currentWords.filter(w => !originalWords.includes(w));
}, [originalWords, currentWords]);

// Après sauvegarde, mettre à jour la référence
const handleSave = async () => {
  await saveListToBackend(currentWords);
  setOriginalWords([...currentWords]);
};
```

---

## 🧪 Critères d'acceptation

**4 états du panel :**
- [ ] État 1 : panel vide, pas de bouton save, CTA grisé
- [ ] État 2 : mots sélectionnés, "Sauvegarder cette liste" visible en footer
- [ ] État 3 : liste chargée à jour, pas de bouton save, bloc info visible
- [ ] État 4 : liste modifiée, "Sauvegarder les modifications" visible en footer

**Bloc de liste chargée :**
- [ ] Fond neutre gris (pas violet)
- [ ] Nom de la liste tronqué avec ellipsis
- [ ] Tags affichés
- [ ] Bouton ✏️ ouvre la modale de modification
- [ ] Bouton ✕ ouvre la modale de détachement

**Bouton footer contextuel :**
- [ ] Affiche "Sauvegarder cette liste" quand pas de liste liée + mots présents
- [ ] Affiche "Sauvegarder les modifications" quand liste liée + modifications
- [ ] Masqué quand liste liée et à jour, ou quand aucun mot
- [ ] Le save des modifications est direct (pas de modale)
- [ ] Flow : bouton → spinner → confirmation verte → disparition

**Modale de modification :**
- [ ] Champs pré-remplis avec données actuelles
- [ ] Nom, description, tags modifiables
- [ ] Aperçu des mots en lecture seule
- [ ] "Mettre à jour" met à jour le bloc info + toast

**Modale de détachement :**
- [ ] Avertissement clair que les mots restent
- [ ] Bouton orange "Détacher"
- [ ] Animation slide out du bloc
- [ ] Footer passe à l'état 2
- [ ] Toast de confirmation

**Badge AJOUTÉ :**
- [ ] Visible sur les mots ajoutés après chargement d'une liste
- [ ] Disparaît après sauvegarde
- [ ] Style violet discret

**Suppression du bandeau jaune :**
- [ ] Le bandeau jaune "Liste modifiée" + "Sauvegarder les modifications" est supprimé
- [ ] Remplacé par le flow décrit dans ce ticket

---

## 📎 Ressources

- `footer-4-states-final.jsx` — Les 4 états du panel côte à côte
- `loaded-list-actions.jsx` — Interactions ✏️ et ✕ avec modales fonctionnelles
- `panel-save-footer.jsx` — Flow save en footer (spinner → confirmation)

---

**Assigné à :** Lead dev
**Reviewer :** Arthuro
**Sprint :** En cours
