# 🎯 SKILL: Antigravity Word Hoard (Banque de Mots)

> **Projet**: Application de ressources orthophoniques pour la gestion de listes de mots
> **Stack**: Vite + TypeScript + React + shadcn-ui + Tailwind CSS
> **Déploiement**: Vercel (antigravity-word-hoard.vercel.app)
> **Repo**: https://github.com/arthurbertheas/antigravity-word-hoard

---

## 🎨 Design System

### Couleurs Principales (HSL)

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--primary` | `243 75% 59%` | `#4f46e5` / `#6C5CE7` | Boutons, accents, liens |
| `--primary-hover` | `245 57% 51%` | `#4338ca` / `#5A4BD1` | Hover states |
| `--primary-active` | `244 54% 41%` | `#3730a3` | Active/pressed |
| `--accent` | `174 72% 56%` | Teal | Accents secondaires |
| `--destructive` | `0 84% 60%` | Rouge | Erreurs, suppression |

### Couleurs Neutres

| Token | HSL | Hex | Usage |
|-------|-----|-----|-------|
| `--background` | `0 0% 100%` | `#FFFFFF` | Fond principal |
| `--foreground` | `222 47% 20%` | `#1A1A2E` | Texte principal |
| `--muted` | `210 40% 96%` | — | Fonds subtils |
| `--muted-foreground` | `215 16% 47%` | `#6B7280` | Texte secondaire |
| `--border` | `214 32% 91%` | `#E5E7EB` | Bordures |
| `--border-light` | — | `#F3F4F6` | Bordures légères (dividers) |
| `--card` | `210 40% 98%` | — | Fond des cartes |
| `--surface` | — | `#F8F9FC` | Fond des inputs/surfaces |

### Feedback Dots

| État | Variable | Hex |
|------|----------|-----|
| Neutre | `--dot-neutral` | `#9ca3af` |
| Positif | `--dot-positive` | `#6ee7b7` |
| Négatif | `--dot-negative` | `#f87171` |

### Catégories Filtres (RGB)

| Catégorie | Variable | Couleur |
|-----------|----------|---------|
| Texte | `--cat-text` | `79 70 229` (Indigo) |
| Structure | `--cat-struct` | `8 145 178` (Cyan) |
| Métrique | `--cat-metric` | `217 119 6` (Amber) |

### Tags / Pills

| Type | Background | Text | Border |
|------|------------|------|--------|
| Tag violet actif | `#F0EDFF` | `#7C6FD4` | — |
| Tag neutre | `#FFFFFF` | inherit | `#E5E7EB` |
| Suggestion | `#FFFFFF` | `#6B7280` | `#E5E7EB` |
| Suggestion hover | — | `#6C5CE7` | `#C4B8FF` |

---

## 🔤 Typographie

### Fonts

| Usage | Font Family | Poids |
|-------|-------------|-------|
| Display (titres) | `Sora` | 600-800 |
| Body (texte) | `DM Sans` | 300-700 |
| Mono (code) | `IBM Plex Mono` | 400-500 |
| Accessibilité | `OpenDyslexic` | 400, 700 |
| École | `MDI Ecole` | 400, 700 |

### Tailles & Styles

| Élément | Classes |
|---------|---------|
| Titre modal | `font-['Sora'] text-[18px] font-[700] text-[#1A1A2E]` |
| Label | `text-[14px] font-[700] text-[#1A1A2E] font-['DM_Sans'] tracking-tight` |
| Label optional | `text-[13px] font-[400] text-[#6B7280]` |
| Input text | `font-['DM_Sans'] text-[14px]` |
| Tag text | `text-[11px] font-[500] font-['DM_Sans']` |
| Counter | `text-[11px] text-[#B0B5C0]` |
| Suggestions label | `text-[11px] text-[#9CA3AF]` |

### Titres (base layer)

```css
h1 { @apply text-3xl md:text-4xl font-bold; letter-spacing: -0.03em; }
h2 { @apply text-xl md:text-2xl font-semibold; }
/* Tous les h1-h6: font-family: Sora; font-weight: 600; letter-spacing: -0.02em; */
```

---

## 📐 Espacements & Radius

### Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `--radius` | `0.75rem` (12px) | Base |
| `rounded-[22px]` | 22px | Modals |
| `rounded-[10px]` | 10px | Inputs, containers |
| `rounded-[8px]` | 8px | Tags, pills |
| `rounded-full` | 50% | Suggestions pills |

### Espacements Récurrents

| Contexte | Valeur |
|----------|--------|
| Modal padding | `p-6` |
| Section gap | `space-y-5` |
| Label margin-bottom | `mb-2.5` |
| Tags gap | `gap-2` |
| Tag padding | `px-[9px] py-[2px]` ou `px-[9px] py-[3px]` |
| Suggestion padding | `px-2.5 py-1` |

---

## 🎭 Shadows

| Token | Valeur |
|-------|--------|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` |
| `--shadow-card` | `0 4px 20px -2px rgb(0 0 0 / 0.08)` |
| `shadow-float` | `0 20px 60px -15px hsl(200 100% 65% / 0.3)` |
| `shadow-glow` | `0 0 40px hsl(200 100% 65% / 0.2)` |
| Primary button | `shadow-[0_4px_12px_rgba(108,92,231,0.2)]` |

---

## 🌈 Gradients

```css
--gradient-card: linear-gradient(135deg, hsl(48 100% 85%), hsl(174 72% 75%));
--gradient-primary: linear-gradient(135deg, hsl(217 91% 55%), hsl(200 91% 55%));
--gradient-subtle: linear-gradient(135deg, hsl(217 91% 55% / 0.05), hsl(174 72% 56% / 0.05));
```

---

## 🧩 Composants Patterns

### Modal Structure

```jsx
<DialogContent className="sm:max-w-[560px] px-0 py-0 border-none rounded-[22px] overflow-hidden">
    <DialogHeader className="p-6 pb-4 border-b border-[#F3F4F6]">
        <DialogTitle className="font-['Sora'] text-[18px] font-[700] text-[#1A1A2E]">
            {/* Emoji + Titre */}
        </DialogTitle>
    </DialogHeader>
    
    <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Contenu */}
    </div>
    
    <DialogFooter className="p-6 pt-4 border-t border-[#F3F4F6]">
        {/* Boutons */}
    </DialogFooter>
</DialogContent>
```

### Input Standard

```jsx
<Input
    className="h-11 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-[#F8F9FC] font-['DM_Sans'] text-[14px] focus-visible:border-[#6C5CE7]"
/>
```

### Label Standard

```jsx
<label className="text-[14px] font-[700] text-[#1A1A2E] font-['DM_Sans'] mb-2.5 block tracking-tight">
    Nom du champ <span className="text-red-500">*</span>
</label>

{/* Avec mention optionnel */}
<label className="text-[14px] font-[700] text-[#1A1A2E] font-['DM_Sans'] mb-2.5 block tracking-tight">
    Description <span className="text-[13px] font-[400] text-[#6B7280] ml-1">(optionnel)</span>
</label>
```

### Bouton Primary

```jsx
<Button className="h-11 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-[600] font-['DM_Sans'] shadow-[0_4px_12px_rgba(108,92,231,0.2)]">
    Action
</Button>
```

### Bouton Secondary / Outline

```jsx
<Button 
    variant="outline"
    className="h-11 border-[1.5px] border-[#E5E7EB] text-[#6B7280] font-[600] font-['DM_Sans'] hover:bg-[#F8F9FC] hover:text-[#1A1A2E]"
>
    Annuler
</Button>
```

### Tag Violet (Actif)

```jsx
<span className="inline-flex items-center gap-1.5 px-[9px] py-[2px] bg-[#F0EDFF] text-[#7C6FD4] text-[11px] font-[500] font-['DM_Sans'] rounded-[8px]">
    {tag}
    <button className="hover:opacity-70">
        <X className="w-3 h-3" />
    </button>
</span>
```

### Tag Neutre (Mot)

```jsx
<span className="inline-flex items-center gap-1.5 px-[9px] py-[3px] bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] font-[500] font-['DM_Sans']">
    {word}
    <button className="text-[#9CA3AF] hover:text-red-500 transition-colors">
        <X className="w-3 h-3" />
    </button>
</span>
```

### Suggestion Pill

```jsx
<button className="px-2.5 py-1 rounded-full border border-[#E5E7EB] bg-white text-[11px] text-[#6B7280] hover:border-[#C4B8FF] hover:text-[#6C5CE7] transition-colors whitespace-nowrap">
    {suggestion}
</button>
```

### Counter (caractères restants)

```jsx
<span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#B0B5C0]">
    {value.length}/50
</span>
```

### Container Tags Input

```jsx
<div className="flex flex-wrap gap-2 p-2 border-[1.5px] border-[#E5E7EB] bg-[#F8F9FC] rounded-[10px] min-h-[44px] transition-all focus-within:border-[#6C5CE7]">
    {/* Tags + input */}
</div>
```

---

## ✨ Animations & Transitions

### Keyframes

| Animation | Description |
|-----------|-------------|
| `fade-in` | opacity 0→1, 0.3s ease-out |
| `slide-up` | translateY(10px)→0 + opacity, 0.4s ease-out |
| `fade-in-up` | translateY(16px)→0 + opacity, 0.4s ease-out |
| `float` | translateY(0)→(-20px)→0, 6s ease-in-out infinite |
| `slide-in-bottom` | translateY(100%)→0, 0.4s cubic-bezier(0.16, 1, 0.3, 1) |

### Classes Utilitaires

| Classe | Effet |
|--------|-------|
| `.hover-lift` | translateY(-2px) + shadow-lg au hover |
| `.interactive-scale` | scale(1.02) hover, scale(0.98) active |
| `.stagger-fade-in` | Animation staggered pour enfants (40ms delay) |
| `.transition-colors` | Transition standard pour couleurs |

### Easing

```css
/* Smooth UI transitions */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Bouncy/snappy */
transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
```

---

## 🔧 Icônes

- **Librairie**: Lucide React
- **Import**: `import { IconName } from 'lucide-react'`
- **Tailles courantes**:
  - `w-3 h-3` (12px) — dans les tags
  - `w-4 h-4` (16px) — boutons, inline
  - `w-5 h-5` (20px) — navigation

---

## 📁 Structure Fichiers

```
src/
├── components/
│   ├── ui/           # shadcn components
│   ├── saved-lists/  # Composants listes sauvegardées
│   └── ...
├── hooks/
├── lib/
│   └── utils.ts      # cn() helper
├── types/
│   └── word.ts       # Type Word
└── index.css         # Variables CSS globales
```

---

## 🛠️ Utilitaires

### cn() Helper

```typescript
import { cn } from '@/lib/utils';

// Utilisation
className={cn(
    "base-classes",
    condition && "conditional-classes",
    error ? "error-classes" : "normal-classes"
)}
```

### Toast

```typescript
import { useToast } from '@/hooks/use-toast';

const { toast, dismiss } = useToast();

toast({
    title: "Succès",
    description: "Action effectuée",
});
```

---

## 📋 Checklist Design

Lors de la création d'un composant, vérifier :

- [ ] Font Sora pour les titres, DM Sans pour le body
- [ ] Couleur primary `#6C5CE7` / `#4f46e5`
- [ ] Inputs: `h-11`, `rounded-[10px]`, `border-[1.5px]`, `bg-[#F8F9FC]`
- [ ] Focus: `focus-visible:border-[#6C5CE7]`
- [ ] Labels: `text-[14px] font-[700]`, `mb-2.5`
- [ ] Tags: `rounded-[8px]`, `text-[11px]`
- [ ] Boutons: `h-11`, `font-[600]`
- [ ] Modals: `rounded-[22px]`, `p-6`
- [ ] Borders: `border-[#E5E7EB]` ou `border-[#F3F4F6]`
- [ ] Shadows sur boutons primary
- [ ] Transitions sur hover states

---

## 🔗 Références

- **Repo**: https://github.com/arthurbertheas/antigravity-word-hoard
- **Live**: https://antigravity-word-hoard.vercel.app
- **Composant référence**: `src/components/saved-lists/SaveListModal.tsx`
