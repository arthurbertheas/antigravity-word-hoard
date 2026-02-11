# 🎫 Ticket Dev : Sélection Aléatoire avec Répartition Équilibrée

## 📋 Résumé

Ajouter un bouton "Aléatoire" à côté de "Tout sélectionner" dans le `ResultsHeader` permettant de sélectionner un nombre précis de mots avec une répartition équilibrée selon les filtres actifs.

**Priorité** : 🟠 High  
**Estimation** : ~6-8h

---

## 🎯 Objectifs Fonctionnels

1. **Bouton "Aléatoire"** avec popover pour choisir le nombre de mots
2. **Répartition équilibrée** selon les filtres multi-valeurs actifs
3. **États mutuellement exclusifs** : "Tout sélectionner" ↔ "Aléatoire"
4. **Modification/Désélection** après sélection initiale

---

## 🏗️ Architecture Technique

### Composants à Créer

#### 1. `RandomSelectButton.tsx`

**Emplacement** : `src/components/RandomSelectButton.tsx`

**Props** :
```typescript
interface RandomSelectButtonProps {
  availableWords: Word[];           // Mots disponibles après filtrage
  activeFilters: WordFilters;       // Filtres actifs (pour calcul répartition)
  randomSelectedCount: number;      // 0 = inactif, >0 = nombre sélectionné
  onRandomSelect: (count: number) => void;
  onRandomDeselect: () => void;
  disabled?: boolean;
}
```

**Responsabilités** :
- Afficher le bouton avec états (inactif/actif)
- Gérer l'ouverture/fermeture du popover
- Valider l'input (min=1, max=availableWords.length)
- Calculer et afficher la répartition estimée
- Déclencher la sélection aléatoire via `onRandomSelect`

---

#### 2. `RandomSelectionPopover.tsx`

**Emplacement** : `src/components/RandomSelectionPopover.tsx`

**Props** :
```typescript
interface RandomSelectionPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  maxWords: number;
  activeFilters: WordFilters;
  currentCount: number;
  isActive: boolean;                // true si déjà sélectionné
  onSelect: (count: number) => void;
  onDeselect: () => void;
}
```

**Sections** :
1. **Input nombre** : Auto-focus, validation au blur
2. **Répartition estimée** : Affichage conditionnel (filtres multi-valeurs uniquement)
3. **Bouton primaire** : "Sélectionner X mots" ou "Modifier (X mots)"
4. **Bouton secondaire** : "Désélectionner" (si actif)

---

### Modifications aux Composants Existants

#### `ResultsHeader.tsx`

**Changements** :
```tsx
// AVANT
<button onClick={onToggleSelectAll}>
  {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
</button>

// APRÈS
<div className="flex items-center gap-3">
  <button 
    onClick={onToggleSelectAll}
    className={isAllSelected ? 'selected' : ''}
  >
    <span className="circle">{isAllSelected && '✓'}</span>
    {isAllSelected ? "Tout désélectionner" : "Tout sélectionner"}
  </button>
  
  <RandomSelectButton
    availableWords={words}
    activeFilters={filters}
    randomSelectedCount={randomSelectedCount}
    onRandomSelect={handleRandomSelect}
    onRandomDeselect={handleRandomDeselect}
  />
</div>
```

**Nouvelles Props** :
```typescript
interface ResultsHeaderProps {
  words: Word[];
  filters: WordFilters;              // NOUVEAU
  isAllSelected: boolean;
  randomSelectedCount: number;       // NOUVEAU (0 = inactif)
  onToggleSelectAll: () => void;
  onRandomSelect: (count: number) => void;  // NOUVEAU
  onRandomDeselect: () => void;      // NOUVEAU
}
```

---

#### `SelectionContext.tsx`

**Nouvelles Méthodes** :
```typescript
interface SelectionContextType {
  // ... existant
  randomSelectedCount: number;       // NOUVEAU
  selectRandom: (count: number, words: Word[], filters: WordFilters) => void;
  deselectRandom: () => void;
}
```

**Implémentation** :
```typescript
const [randomSelectedCount, setRandomSelectedCount] = useState(0);

const selectRandom = (count: number, words: Word[], filters: WordFilters) => {
  const selected = selectRandomWords(count, words, filters);
  setSelection(selected);
  setRandomSelectedCount(count);
};

const deselectRandom = () => {
  clearSelection();
  setRandomSelectedCount(0);
};
```

---

## 🧮 Algorithme de Répartition

### Fonction Principale

**Emplacement** : `src/utils/random-selection.ts`

```typescript
export function selectRandomWords(
  count: number,
  words: Word[],
  filters: WordFilters
): Word[] {
  // 1. Identifier les critères de répartition (filtres multi-valeurs)
  const distributionCriteria = getDistributionCriteria(filters);
  
  // 2. Si aucun critère → sélection aléatoire simple
  if (distributionCriteria.length === 0) {
    return shuffleArray(words).slice(0, count);
  }
  
  // 3. Créer les combinaisons de critères
  const combinations = createCombinations(distributionCriteria);
  
  // 4. Répartir équitablement (best effort)
  const wordsPerCombination = Math.ceil(count / combinations.length);
  const selected: Word[] = [];
  
  for (const combo of combinations) {
    const matching = words.filter(w => matchesCombination(w, combo));
    const shuffled = shuffleArray(matching);
    const toTake = Math.min(wordsPerCombination, shuffled.length);
    selected.push(...shuffled.slice(0, toTake));
    
    if (selected.length >= count) break;
  }
  
  // 5. Compléter si nécessaire (best effort)
  if (selected.length < count) {
    const remaining = words.filter(w => !selected.includes(w));
    const shuffled = shuffleArray(remaining);
    selected.push(...shuffled.slice(0, count - selected.length));
  }
  
  // 6. Shuffle final et limiter au count exact
  return shuffleArray(selected).slice(0, count);
}
```

---

### Fonctions Auxiliaires

```typescript
// Identifier les filtres avec plusieurs valeurs
function getDistributionCriteria(filters: WordFilters): DistributionCriterion[] {
  const criteria: DistributionCriterion[] = [];
  
  // Syllabes (range)
  if (filters.syllables?.min && filters.syllables?.max) {
    const range = filters.syllables.max - filters.syllables.min + 1;
    if (range > 1) {
      criteria.push({
        type: 'syllables',
        values: Array.from({ length: range }, (_, i) => filters.syllables!.min + i)
      });
    }
  }
  
  // Phonèmes (array)
  if (filters.phonemes && filters.phonemes.length > 1) {
    criteria.push({ type: 'phonemes', values: filters.phonemes });
  }
  
  // Positions (array)
  if (filters.positions && filters.positions.length > 1) {
    criteria.push({ type: 'positions', values: filters.positions });
  }
  
  // Catégories (array)
  if (filters.categories && filters.categories.length > 1) {
    criteria.push({ type: 'categories', values: filters.categories });
  }
  
  // Graphèmes (array)
  if (filters.graphemes && filters.graphemes.length > 1) {
    criteria.push({ type: 'graphemes', values: filters.graphemes });
  }
  
  return criteria;
}

// Créer toutes les combinaisons possibles
function createCombinations(criteria: DistributionCriterion[]): Combination[] {
  if (criteria.length === 0) return [];
  if (criteria.length === 1) {
    return criteria[0].values.map(v => ({ [criteria[0].type]: v }));
  }
  
  // Produit cartésien récursif
  const [first, ...rest] = criteria;
  const restCombos = createCombinations(rest);
  
  return first.values.flatMap(value =>
    restCombos.map(combo => ({ [first.type]: value, ...combo }))
  );
}

// Vérifier si un mot correspond à une combinaison
function matchesCombination(word: Word, combo: Combination): boolean {
  // Implémenter la logique de matching selon les critères
  // Exemple pour syllabes : word.NBSYLL === combo.syllables
  // Exemple pour phonèmes : word.PHONEMES.includes(combo.phonemes)
  // etc.
}

// Shuffle Fisher-Yates
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

---

### Calcul de Répartition Estimée (pour affichage)

```typescript
export function calculateDistribution(
  count: number,
  filters: WordFilters
): DistributionPreview[] {
  const criteria = getDistributionCriteria(filters);
  
  return criteria.map(criterion => {
    const perValue = Math.round(count / criterion.values.length);
    const label = formatCriterionLabel(criterion);
    return { label, perValue };
  });
}

function formatCriterionLabel(criterion: DistributionCriterion): string {
  switch (criterion.type) {
    case 'syllables':
      return `Syllabes (${criterion.values.join(', ')})`;
    case 'phonemes':
      return `Phonèmes (${criterion.values.join(', ')})`;
    case 'positions':
      return `Positions (${criterion.values.join(', ')})`;
    case 'categories':
      return `Catégories (${criterion.values.join(', ')})`;
    case 'graphemes':
      return `Graphèmes (${criterion.values.join(', ')})`;
    default:
      return '';
  }
}
```

---

## 🎨 Styles CSS

**Fichier** : `src/components/RandomSelectButton.tsx` (Tailwind classes)

```tsx
// Bouton inactif
<button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e0e3eb] rounded-[10px] hover:border-[#6366f1] hover:bg-[#fafaff] transition-all">

// Bouton actif (sélectionné)
<button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#6366f1] text-[#6366f1] rounded-[10px] hover:bg-[#fafaff] transition-all">

// Cercle vide
<div className="w-[18px] h-[18px] border-2 border-[#d0d3e0] rounded-full" />

// Cercle coché
<div className="w-[18px] h-[18px] border-2 border-[#6366f1] bg-[#6366f1] rounded-full flex items-center justify-center">
  <Check className="w-3 h-3 text-white" />
</div>

// Chevron (rotation au clic)
<ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
```

---

## ✅ Critères d'Acceptance

### Fonctionnels
- [ ] Bouton "Aléatoire" affiché à côté de "Tout sélectionner" avec le même style
- [ ] Clic sur "Aléatoire" ouvre le popover
- [ ] Input nombre avec auto-correction (min=1, max=mots disponibles)
- [ ] Section "Répartition estimée" affiche uniquement les filtres multi-valeurs
- [ ] Bouton "Sélectionner X mots" lance la sélection aléatoire
- [ ] État actif : bouton affiche "✓ X aléatoires", popover affiche "Modifier" + "Désélectionner"
- [ ] "Tout sélectionner" et "Aléatoire" sont mutuellement exclusifs
- [ ] Chaque nouvelle sélection génère un tirage différent

### Techniques
- [ ] Algorithme répartit équitablement selon filtres actifs (best effort)
- [ ] Performance acceptable sur 1000+ mots (< 500ms)
- [ ] Pas de duplication de mots dans la sélection
- [ ] État persistant pendant la session (pas entre sessions)

### UI/UX
- [ ] Popover se ferme au clic sur backdrop
- [ ] Auto-focus sur l'input à l'ouverture
- [ ] Transitions fluides (chevron rotation, états boutons)
- [ ] Responsive (mobile-friendly)

---

## 📦 Fichiers à Créer/Modifier

### Nouveaux Fichiers
- `src/components/RandomSelectButton.tsx`
- `src/components/RandomSelectionPopover.tsx`
- `src/utils/random-selection.ts`
- `src/utils/random-selection.test.ts` (tests unitaires)

### Fichiers à Modifier
- `src/components/ResultsHeader.tsx`
- `src/contexts/SelectionContext.tsx`
- `src/pages/Index.tsx` (passer `filters` au `ResultsHeader`)

---

## 🧪 Tests Suggérés

### Tests Unitaires (`random-selection.test.ts`)
```typescript
describe('selectRandomWords', () => {
  it('should select exact count when enough words available', () => {});
  it('should handle count > available words (best effort)', () => {});
  it('should distribute evenly across syllable range', () => {});
  it('should distribute evenly across multiple phonemes', () => {});
  it('should handle combined criteria (syllables + phonemes)', () => {});
  it('should fallback to simple random if no multi-value filters', () => {});
  it('should not duplicate words', () => {});
});

describe('calculateDistribution', () => {
  it('should return empty array if no multi-value filters', () => {});
  it('should calculate per-value count correctly', () => {});
  it('should format labels correctly', () => {});
});
```

### Tests Manuels
1. **Sélection simple** : Aucun filtre → sélection aléatoire pure
2. **Syllabes 2-4** : Vérifier répartition ~équilibrée
3. **Phonèmes multiples** : Vérifier répartition ~équilibrée
4. **Combinaison** : Syllabes + Phonèmes → vérifier produit cartésien
5. **Best effort** : Demander 100 mots avec seulement 50 disponibles
6. **Mutuelle exclusion** : Activer "Tout" puis "Aléatoire" → "Tout" se désactive
7. **Modification** : Sélectionner 30, rouvrir popover, modifier à 50
8. **Désélection** : Cliquer "Désélectionner" → vide la sélection

---

## 🔗 Ressources

- **Mockup React** : Fourni par le lead designer (voir ticket design)
- **Types existants** : `src/types/word.ts` (`Word`, `WordFilters`)
- **Context existant** : `src/contexts/SelectionContext.tsx`

---

## ❓ Questions Ouvertes

1. **Performance** : Optimiser si >1000 mots ? → **Non** (acceptable tel quel)
2. **Persistance** : Mémoriser le nombre entre sessions ? → **Non**
3. **Analytics** : Tracker l'utilisation de la feature ? → **À décider**

---

## 📝 Notes d'Implémentation

- Utiliser `shadcn/ui` Popover si disponible, sinon créer un custom
- Respecter la palette de couleurs existante (`#6366f1` pour l'accent)
- Utiliser `lucide-react` pour les icônes (Check, ChevronDown)
- Suivre les conventions de nommage du projet (PascalCase pour composants)
