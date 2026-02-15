# Design Document : Modale d'Export de Liste de Mots

**Date :** 2026-02-15
**Auteur :** Lead Technique
**Statut :** Approuvé
**Version :** 1.0

---

## 1. Contexte et Objectif

### 1.1 Problématique

Les orthophonistes utilisent le panneau "Ma Liste" pour sélectionner des mots à travailler avec leurs patients. Actuellement, ils doivent enregistrer la liste avant de pouvoir l'exporter, ce qui crée une friction inutile dans leur workflow quotidien.

### 1.2 Besoin Utilisateur

Permettre l'export direct d'une liste de mots depuis le panneau "Ma Liste" **sans obligation de sauvegarde préalable**, avec contrôle sur :
- Le format d'export (PDF, Word, Impression)
- L'affichage (Mot seul, Image seule, Mot + Image)
- La mise en page (Liste simple, Grille 2/3 colonnes, Flashcards, Tableau détaillé)
- Les options additionnelles (date, phonèmes, numérotation, catégories)

### 1.3 Public Cible

Orthophonistes professionnels ayant besoin de créer rapidement des documents de travail personnalisés pour leurs patients.

---

## 2. Décisions de Design

### 2.1 Approches Considérées

**Option A : Modale Full-Screen**
- ✅ Plus d'espace pour preview
- ✅ Séparation claire du contexte
- ❌ Masque complètement l'interface principale
- ❌ Nécessite fermeture pour revenir

**Option B : Panneau Remplaçant** ⭐ **RETENU**
- ✅ Transition fluide depuis "Ma Liste"
- ✅ Préserve le contexte visuel (zone de mots visible)
- ✅ Bouton retour pour navigation naturelle
- ✅ Meilleure utilisation de l'espace existant
- ❌ Espace preview légèrement plus contraint

**Justification :** L'Option B offre une meilleure continuité du workflow. L'utilisateur reste dans le même contexte visuel et peut facilement revenir à "Ma Liste" avec un bouton retour.

### 2.2 Principes de Design UX

1. **Hiérarchie des Choix**
   - Affichage en premier (choix le plus impactant)
   - Format en dernier (détail technique)

2. **Minimalisme**
   - Header réduit à une ligne
   - Espacement optimisé (20px entre sections)
   - Format compact avec icônes (3 colonnes)

3. **Feedback Visuel**
   - Preview temps réel
   - États hover/selected clairs
   - Indicateurs requis (*) vs optionnel

4. **Accessibilité**
   - Tous les contrôles visibles sans scroll
   - Labels clairs et contrastés
   - Taille de clic confortable (44x44px minimum)

---

## 3. Architecture Technique

### 3.1 Composants React

```
src/components/export/
├── ExportPanel.tsx          # Composant principal (remplace SelectionTray)
├── ExportOptions.tsx        # Sidebar avec formulaire d'options
├── ExportPreview.tsx        # Zone de preview du document
└── export-utils.ts          # Logique d'export (PDF/Word/Print)
```

### 3.2 État et Props

```typescript
interface ExportPanelProps {
  selectedWords: Word[];
  onClose: () => void;
}

interface ExportSettings {
  // Affichage
  display: 'wordOnly' | 'imageOnly' | 'wordAndImage';

  // Format
  format: 'pdf' | 'word' | 'print';

  // Mise en page
  layout: 'list-1col' | 'grid-2col' | 'grid-3col' | 'flashcards' | 'table';

  // Options
  includeDate: boolean;
  includePhonemes: boolean;
  numberWords: boolean;
  includeCategories: boolean;
}
```

### 3.3 Intégration avec SelectionTray

Ajout d'un bouton "Exporter" dans `SelectionTray.tsx` qui déclenche l'affichage d'`ExportPanel` :

```typescript
// Dans SelectionTray.tsx
const [showExportPanel, setShowExportPanel] = useState(false);

if (showExportPanel) {
  return (
    <ExportPanel
      selectedWords={words}
      onClose={() => setShowExportPanel(false)}
    />
  );
}
```

---

## 4. Spécifications UI

### 4.1 Dimensions

- **Modal Width :** 900px max
- **Sidebar :** 340px fixe
- **Preview :** flex-grow (560px environ)
- **Height :** 500px (body) + header + footer = ~600px total

### 4.2 Design System

**Typographie**
- Font Family : `DM Sans`
- Titres : 16px / 600
- Labels : 12px / 600 uppercase
- Texte : 13px / 500
- Checkbox : 12px / 400

**Couleurs**
- Primary : `#6C5CE7` (violet)
- Border : `#E5E7EB`
- Background : `#FAFBFC` (sidebar)
- Text : `#1A1A1A` / `#374151` / `#9CA3AF`
- Hover : `#C4B8FF` (border)
- Selected : `#F7F6FE` (background)

**Espacement**
- Section margin : 20px
- Padding sidebar : 24px 20px
- Input padding : 9px 12px
- Gap checkboxes : 6px 8px

### 4.3 Sections du Formulaire

1. **Affichage** (requis)
   - 3 radio buttons verticaux
   - Mot seul / Image seule / Mot + Image

2. **Mise en page** (requis)
   - Select dropdown
   - Options : Liste simple, Grille 2/3 col, Flashcards, Tableau

3. **Options** (optionnel)
   - 4 checkboxes en grille 2x2
   - Inclure date / phonèmes / numérotation / catégories

4. **Format** (requis)
   - 3 boutons icônes en grille 3x1
   - PDF (rouge) / Word (bleu) / Imprimer (vert)

---

## 5. Data Flow

### 5.1 Flux de Génération d'Export

```
[User configure options]
  → Update ExportSettings state
  → Update Preview (real-time)
  → Click "Générer l'export"
  → Generate document based on format
    ├─ PDF: Use jsPDF library
    ├─ Word: Use docx library
    └─ Print: Use window.print() with styled content
  → Download or print
```

### 5.2 Gestion du Preview

Le preview se met à jour en temps réel à chaque changement d'option :

```typescript
useEffect(() => {
  const previewContent = generatePreviewContent(selectedWords, exportSettings);
  setPreview(previewContent);
}, [selectedWords, exportSettings]);
```

---

## 6. Considérations d'Implémentation

### 6.1 Bibliothèques Requises

**Pour PDF :**
```bash
npm install jspdf jspdf-autotable
```

**Pour Word :**
```bash
npm install docx file-saver
```

**Pour Images :**
- Utiliser les URLs existantes des mots (champ `IMAGE_URL`)
- Gérer le cas où l'image n'existe pas

### 6.2 Gestion des Images

- Si display = 'imageOnly' ou 'wordAndImage', vérifier `word.IMAGE_URL`
- Si image manquante, afficher placeholder ou skip selon le mode
- Pour PDF : convertir images en base64 si nécessaire
- Pour Word : insérer images via docx library

### 6.3 Layouts à Implémenter

1. **Liste simple (1 col)** : Liste à puces verticale
2. **Grille 2/3 colonnes** : Grid CSS avec colonnes
3. **Flashcards** : Cards avec mot/image recto-verso style
4. **Tableau détaillé** : Table avec colonnes (Mot, Image, Phonèmes, etc.)

### 6.4 Performance

- Limiter le nombre de mots exportables (max 100 ?)
- Lazy load des images pour preview
- Debounce des updates de preview si nécessaire

### 6.5 Gestion d'Erreurs

- Afficher message si aucun mot sélectionné
- Gérer échec de chargement d'images
- Fallback si génération PDF/Word échoue
- Validation des settings avant génération

---

## 7. Plan de Test

### 7.1 Tests Unitaires

- `ExportOptions.tsx` : Changements d'état des formulaires
- `export-utils.ts` : Logique de génération pour chaque format/layout
- Preview rendering avec différentes configurations

### 7.2 Tests d'Intégration

- Workflow complet : Sélection → Export → Téléchargement
- Transition SelectionTray ↔ ExportPanel
- Preview se met à jour avec options

### 7.3 Tests E2E

- Scénario 1 : Export PDF avec mot seul en liste simple
- Scénario 2 : Export Word avec mot+image en grille 3 colonnes
- Scénario 3 : Impression avec images seules en flashcards
- Scénario 4 : Vérifier toutes les options cochées apparaissent dans le doc

### 7.4 Tests Manuels

- Vérifier design pixel-perfect vs mockup
- Tester responsive si modal < 900px
- Vérifier accessibilité clavier (tab, enter, espace)
- Tester avec 1 mot, 5 mots, 50 mots, 100 mots

---

## 8. Critères de Succès

✅ L'orthophoniste peut exporter une liste sans la sauvegarder
✅ Tous les formats (PDF/Word/Print) fonctionnent correctement
✅ Preview temps réel reflète fidèlement le résultat final
✅ UI propre et professionnelle selon design system
✅ Aucun scroll nécessaire dans la sidebar d'options
✅ Images s'affichent correctement quand sélectionné
✅ Les options (date, phonèmes, etc.) apparaissent dans le document exporté

---

## 9. Évolutions Futures (Hors Scope)

- Sauvegarde des préférences d'export par utilisateur
- Templates d'export personnalisables
- Export vers d'autres formats (Excel, CSV)
- Partage direct par email
- Génération de QR code pour partage mobile

---

## 10. Annexes

### 10.1 Mockup de Référence

Voir fichier : `.interface-design/export-modal-clean.html`

### 10.2 Composants Existants à Référencer

- `SelectionTray.tsx` : Structure du panneau latéral
- `WordCard.tsx` : Affichage des mots individuels
- `PlayerContext.tsx` : Gestion des settings (pattern similaire pour ExportSettings)

---

**Approbation :**
- [x] Design UX validé
- [x] Architecture technique validée
- [ ] Implémentation (voir plan d'implémentation séparé)
