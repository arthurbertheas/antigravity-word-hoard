# Clinical Elegance Export Design Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate professional "Clinical Elegance" design into Print exports with dynamic layout support (list-1col, grid-2col, grid-3col, flashcards, table)

**Architecture:** Replace basic HTML/CSS in exportToPrint() with professional design system featuring Crimson Pro/Inter typography, violet #6C5CE7 accents, gradient borders, and responsive grid layouts. CSS dynamically generated based on settings.layout.

**Tech Stack:** TypeScript, HTML5, CSS3, Google Fonts (Crimson Pro, Inter), jsPDF (future), docx (future)

---

## Task 1: Create Design System Foundation

**Files:**
- Modify: `src/lib/export-utils.ts:457-560` (exportToPrint function)

**Step 1: Add Google Fonts import and CSS variables**

Replace the current `<style>` block (lines 465-530) with professional design system:

```typescript
export function exportToPrint(words: Word[], settings: ExportSettings): void {
  let html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mots à retravailler</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

      <style>
        /* CSS Variables */
        :root {
          --color-primary: #6C5CE7;
          --color-primary-light: #A29BFE;
          --color-primary-dark: #5B4CD6;
          --color-text-primary: #1A202C;
          --color-text-secondary: #718096;
          --color-text-muted: #A0AEC0;
          --color-border: #E2E8F0;
          --color-bg-card: #FAFBFC;
          --font-serif: 'Crimson Pro', Georgia, serif;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Reset */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Base styles */
        body {
          font-family: var(--font-sans);
          color: var(--color-text-primary);
          line-height: 1.6;
          padding: 48px 40px;
          background: white;
        }

        @page {
          size: A4;
          margin: 20mm;
        }

        @media print {
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
```

**Step 2: Test Google Fonts load**

Create test HTML file temporarily to verify fonts load:

```bash
# Create in project root temporarily
cat > test-fonts.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    .serif { font-family: 'Crimson Pro', serif; font-size: 32px; }
    .sans { font-family: 'Inter', sans-serif; font-size: 16px; }
  </style>
</head>
<body>
  <div class="serif">Crimson Pro Test</div>
  <div class="sans">Inter Test</div>
</body>
</html>
EOF
```

Open test-fonts.html in browser - fonts should render distinctively.

**Step 3: Remove test file**

```bash
rm test-fonts.html
```

**Step 4: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): add design system foundation with Google Fonts

- Add Crimson Pro (serif) and Inter (sans-serif) fonts
- Define CSS variables for colors, typography
- Set up base styles and print media queries"
```

---

## Task 2: Create Professional Header Component

**Files:**
- Modify: `src/lib/export-utils.ts:457-560` (exportToPrint function)

**Step 1: Add header CSS after base styles**

Add to `<style>` block:

```css
/* Header Section */
.document-header {
  border-bottom: 3px solid transparent;
  border-image: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-image-slice: 1;
  padding-bottom: 24px;
  margin-bottom: 40px;
}

.header-title {
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.5px;
  margin-bottom: 8px;
}

.header-subtitle {
  font-size: 15px;
  color: var(--color-primary);
  font-weight: 500;
  margin-bottom: 12px;
}

.header-meta {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 16px;
  height: 16px;
  color: var(--color-primary);
}
```

**Step 2: Replace header HTML generation**

After `<body>`, replace existing header code with:

```typescript
  html += `
    <header class="document-header">
      <h1 class="header-title">Mots à retravailler</h1>
      <p class="header-subtitle">Liste d'exercices personnalisée</p>
      <div class="header-meta">
  `;

  if (settings.includeDate) {
    html += `
        <div class="meta-item">
          <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>${new Date().toLocaleDateString('fr-FR')}</span>
        </div>
    `;
  }

  html += `
        <div class="meta-item">
          <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <span>${words.length} mots sélectionnés</span>
        </div>
      </div>
    </header>
  `;
```

**Step 3: Test header rendering**

Run dev server and test print preview:

```bash
npm run dev
```

In browser: Select words → Export → Print → Check print preview
Expected: Professional header with gradient border, icons, metadata

**Step 4: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): add professional header with gradient border

- Crimson Pro serif title
- Violet subtitle
- SVG icons for date and word count
- Gradient border accent"
```

---

## Task 3: Create Professional Footer Component

**Files:**
- Modify: `src/lib/export-utils.ts:457-560` (exportToPrint function)

**Step 1: Add footer CSS**

Add to `<style>` block:

```css
/* Footer */
.document-footer {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.footer-brand {
  font-family: var(--font-serif);
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: 6px;
}

.footer-tagline {
  font-size: 11px;
  color: #CBD5E0;
  letter-spacing: 0.5px;
}

@media print {
  .document-footer {
    page-break-inside: avoid;
  }
}
```

**Step 2: Replace footer HTML generation**

At the end, before `</body>`, replace existing footer with:

```typescript
  html += `
    <footer class="document-footer">
      <div class="footer-brand">Généré depuis Ressources Orthophonie</div>
      <div class="footer-tagline">Document créé avec soin pour la rééducation</div>
    </footer>
  `;
```

**Step 3: Test footer rendering**

Test print preview - footer should appear at bottom with elegant styling.

**Step 4: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): add professional footer component

- Serif italic brand text
- Secondary tagline
- Page-break protection for print"
```

---

## Task 4: Implement list-1col Layout

**Files:**
- Modify: `src/lib/export-utils.ts:457-560` (exportToPrint function)

**Step 1: Add list-1col CSS**

Add to `<style>` block:

```css
/* List 1 Column Layout */
.word-list-1col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.word-item-list {
  background: linear-gradient(135deg, var(--color-bg-card) 0%, #FFFFFF 100%);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  gap: 14px;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.word-item-list::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}

.word-number {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B7FE8 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 15px;
  box-shadow: 0 2px 8px rgba(108, 92, 231, 0.25);
}

.word-bullet {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--color-primary);
  font-weight: 600;
}

.word-content-list {
  flex: 1;
  display: flex;
  gap: 14px;
  align-items: center;
}

.word-image-list {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background: white;
}

.word-details {
  flex: 1;
}

.word-text {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 6px;
  line-height: 1.3;
}

.word-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.word-phoneme {
  font-size: 14px;
  color: var(--color-primary);
  font-style: italic;
}

.word-category {
  display: inline-block;
  font-size: 11px;
  color: var(--color-text-secondary);
  background: #EDF2F7;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

@media print {
  .word-item-list {
    page-break-inside: avoid;
  }
}
```

**Step 2: Generate list-1col HTML**

After header, add content generation:

```typescript
  // Generate content based on layout
  if (settings.layout === 'list-1col') {
    html += `<div class="word-list-1col">`;

    words.forEach((word, index) => {
      html += `
        <div class="word-item-list">
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : `<div class="word-bullet">•</div>`
          }
          <div class="word-content-list">
      `;

      // Image (if applicable)
      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="word-image-list" />`;
      }

      // Text content
      if (settings.display !== 'imageOnly') {
        html += `<div class="word-details">`;
        html += `<div class="word-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          html += `</div>`;
        }

        html += `</div>`;
      }

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;
  }
```

**Step 3: Test list-1col layout**

Test all combinations:
- wordOnly without numbers
- wordOnly with numbers
- wordAndImage without numbers
- wordAndImage with numbers
- wordAndImage with phonemes
- wordAndImage with categories
- wordAndImage with phonemes + categories
- imageOnly

Expected: Professional cards with gradient accent, circular badges, images inline

**Step 4: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): implement list-1col layout

- Professional card design with gradient accent
- Circular numbered badges or bullet points
- Inline images with word details
- Support all display modes and options"
```

---

## Task 5: Implement grid-2col Layout

**Files:**
- Modify: `src/lib/export-utils.ts:457-560` (exportToPrint function)

**Step 1: Add grid-2col CSS**

Add to `<style>` block:

```css
/* Grid 2 Columns Layout */
.word-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.word-card {
  background: linear-gradient(135deg, var(--color-bg-card) 0%, #FFFFFF 100%);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
}

.word-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}

.word-card-content {
  flex: 1;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.word-image-card {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background: white;
}

@media print {
  .word-card {
    page-break-inside: avoid;
  }
}
```

**Step 2: Generate grid-2col HTML**

Add to layout generation (after list-1col block):

```typescript
  else if (settings.layout === 'grid-2col') {
    html += `<div class="word-grid-2col">`;

    words.forEach((word, index) => {
      html += `
        <div class="word-card">
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : `<div class="word-bullet">•</div>`
          }
          <div class="word-card-content">
      `;

      // Image (if applicable)
      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="word-image-card" />`;
      }

      // Text content
      if (settings.display !== 'imageOnly') {
        html += `<div class="word-details">`;
        html += `<div class="word-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          html += `</div>`;
        }

        html += `</div>`;
      }

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;
  }
```

**Step 3: Test grid-2col layout**

Test all combinations with grid-2col selected.
Expected: 2-column grid, cards with gradient accent, responsive to print

**Step 4: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): implement grid-2col layout

- 2-column responsive grid
- Same card design as list layout
- Page-break protection"
```

---

## Task 6: Implement grid-3col Layout

**Files:**
- Modify: `src/lib/export-utils.ts:457-560` (exportToPrint function)

**Step 1: Add grid-3col CSS**

Add to `<style>` block:

```css
/* Grid 3 Columns Layout */
.word-grid-3col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* Smaller cards for 3 columns */
.word-grid-3col .word-card {
  padding: 16px;
}

.word-grid-3col .word-number {
  width: 30px;
  height: 30px;
  font-size: 13px;
}

.word-grid-3col .word-bullet {
  width: 30px;
  height: 30px;
  font-size: 16px;
}

.word-grid-3col .word-image-card {
  width: 48px;
  height: 48px;
}

.word-grid-3col .word-text {
  font-size: 18px;
}

.word-grid-3col .word-phoneme {
  font-size: 12px;
}

.word-grid-3col .word-category {
  font-size: 10px;
  padding: 3px 8px;
}
```

**Step 2: Generate grid-3col HTML**

Add to layout generation:

```typescript
  else if (settings.layout === 'grid-3col') {
    html += `<div class="word-grid-3col">`;

    words.forEach((word, index) => {
      html += `
        <div class="word-card">
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : `<div class="word-bullet">•</div>`
          }
          <div class="word-card-content">
      `;

      // Image (if applicable)
      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="word-image-card" />`;
      }

      // Text content
      if (settings.display !== 'imageOnly') {
        html += `<div class="word-details">`;
        html += `<div class="word-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          html += `</div>`;
        }

        html += `</div>`;
      }

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;
  }
```

**Step 3: Test grid-3col layout**

Test with grid-3col selected.
Expected: 3-column grid, smaller cards, still professional

**Step 4: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): implement grid-3col layout

- 3-column responsive grid
- Scaled-down card design for density
- Maintains professional aesthetic"
```

---

## Task 7: Implement flashcards Layout

**Files:**
- Modify: `src/lib/export-utils.ts:457-560` (exportToPrint function)

**Step 1: Add flashcards CSS**

Add to `<style>` block:

```css
/* Flashcards Layout */
.word-flashcards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.flashcard {
  background: linear-gradient(135deg, var(--color-bg-card) 0%, #FFFFFF 100%);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.flashcard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
}

.flashcard-number {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B7FE8 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(108, 92, 231, 0.25);
  z-index: 1;
}

.flashcard-image {
  width: 100%;
  height: 120px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--color-border);
  background: white;
}

.flashcard-text {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
}

.flashcard-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  text-align: center;
}

.flashcard-phoneme {
  font-size: 12px;
  color: var(--color-primary);
  font-style: italic;
}

.flashcard-category {
  font-size: 10px;
  color: var(--color-text-secondary);
  background: #EDF2F7;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

@media print {
  .flashcard {
    page-break-inside: avoid;
  }
}
```

**Step 2: Generate flashcards HTML**

Add to layout generation:

```typescript
  else if (settings.layout === 'flashcards') {
    html += `<div class="word-flashcards">`;

    words.forEach((word, index) => {
      html += `<div class="flashcard">`;

      if (settings.numberWords) {
        html += `<div class="flashcard-number">${index + 1}</div>`;
      }

      // Image (if applicable)
      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="flashcard-image" />`;
      }

      // Text content
      if (settings.display !== 'imageOnly') {
        html += `<div class="flashcard-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories) {
          html += `<div class="flashcard-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="flashcard-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="flashcard-category">${word.SYNT}</span>`;
          }
          html += `</div>`;
        }
      }

      html += `</div>`;
    });

    html += `</div>`;
  }
```

**Step 3: Test flashcards layout**

Test with flashcards selected.
Expected: 4-column grid, centered images, compact cards

**Step 4: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): implement flashcards layout

- 4-column grid for flashcard style
- Large centered images
- Overlay numbered badge
- Compact centered text"
```

---

## Task 8: Implement table Layout

**Files:**
- Modify: `src/lib/export-utils.ts:457-560` (exportToPrint function)

**Step 1: Add table CSS**

Add to `<style>` block:

```css
/* Table Layout */
.word-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.word-table thead {
  background: linear-gradient(135deg, var(--color-bg-card) 0%, #FFFFFF 100%);
  border-bottom: 2px solid var(--color-primary);
}

.word-table th {
  font-family: var(--font-sans);
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.word-table tbody tr {
  border-bottom: 1px solid var(--color-border);
}

.word-table tbody tr:hover {
  background: var(--color-bg-card);
}

.word-table td {
  padding: 12px 16px;
  vertical-align: middle;
}

.table-number {
  width: 50px;
  text-align: center;
  font-weight: 600;
  color: var(--color-primary);
}

.table-image {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.table-word {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.table-phoneme {
  color: var(--color-primary);
  font-style: italic;
  font-size: 13px;
}

.table-category {
  font-size: 11px;
  color: var(--color-text-secondary);
  background: #EDF2F7;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  display: inline-block;
}

@media print {
  .word-table {
    page-break-inside: avoid;
  }

  .word-table tbody tr {
    page-break-inside: avoid;
  }
}
```

**Step 2: Generate table HTML**

Add to layout generation:

```typescript
  else if (settings.layout === 'table') {
    html += `<table class="word-table">`;
    html += `<thead><tr>`;

    if (settings.numberWords) {
      html += `<th>#</th>`;
    }

    if (settings.display === 'imageOnly' || settings.display === 'wordAndImage') {
      html += `<th>Image</th>`;
    }

    if (settings.display !== 'imageOnly') {
      html += `<th>Mot</th>`;
    }

    if (settings.includePhonemes) {
      html += `<th>Phonème</th>`;
    }

    if (settings.includeCategories) {
      html += `<th>Catégorie</th>`;
    }

    html += `</tr></thead>`;
    html += `<tbody>`;

    words.forEach((word, index) => {
      html += `<tr>`;

      if (settings.numberWords) {
        html += `<td class="table-number">${index + 1}</td>`;
      }

      if (settings.display === 'imageOnly' || settings.display === 'wordAndImage') {
        html += `<td>`;
        if (word["image associée"]) {
          html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="table-image" />`;
        }
        html += `</td>`;
      }

      if (settings.display !== 'imageOnly') {
        html += `<td class="table-word">${word.MOTS}</td>`;
      }

      if (settings.includePhonemes) {
        html += `<td class="table-phoneme">${word.PHONEMES || ''}</td>`;
      }

      if (settings.includeCategories) {
        html += `<td><span class="table-category">${word.SYNT || ''}</span></td>`;
      }

      html += `</tr>`;
    });

    html += `</tbody></table>`;
  }
```

**Step 3: Test table layout**

Test with table selected, various column combinations.
Expected: Professional table with header, alternating rows, violet accent

**Step 4: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): implement table layout

- Professional table with headers
- Dynamic columns based on settings
- Row hover effects
- Page-break protection"
```

---

## Task 9: Add Fallback for Unknown Layout

**Files:**
- Modify: `src/lib/export-utils.ts:457-560` (exportToPrint function)

**Step 1: Add else clause for unknown layouts**

After all layout blocks, add:

```typescript
  else {
    // Fallback: use list-1col for unknown layouts
    console.warn(`Unknown layout: ${settings.layout}, falling back to list-1col`);

    html += `<div class="word-list-1col">`;

    words.forEach((word, index) => {
      html += `
        <div class="word-item-list">
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : `<div class="word-bullet">•</div>`
          }
          <div class="word-content-list">
      `;

      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="word-image-list" />`;
      }

      if (settings.display !== 'imageOnly') {
        html += `<div class="word-details">`;
        html += `<div class="word-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          html += `</div>`;
        }

        html += `</div>`;
      }

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;
  }
```

**Step 2: Test fallback**

Temporarily change ExportSettings type to allow invalid layout:
```typescript
const testSettings = { ...settings, layout: 'invalid-layout' as any };
```

Expected: Console warning, falls back to list-1col

**Step 3: Remove test code**

**Step 4: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): add fallback for unknown layouts

- Logs warning for unknown layout types
- Falls back to list-1col
- Prevents export failures"
```

---

## Task 10: Comprehensive Testing

**Files:**
- Test: Browser print preview

**Step 1: Test all layout combinations**

Create checklist and test each:

```
Layout: list-1col
  - [ ] wordOnly, no numbers
  - [ ] wordOnly, with numbers
  - [ ] wordAndImage, no numbers
  - [ ] wordAndImage, with numbers
  - [ ] wordAndImage, with phonemes
  - [ ] wordAndImage, with categories
  - [ ] wordAndImage, with phonemes + categories
  - [ ] imageOnly

Layout: grid-2col
  - [ ] wordOnly, no numbers
  - [ ] wordOnly, with numbers
  - [ ] wordAndImage, no numbers
  - [ ] wordAndImage, with numbers
  - [ ] wordAndImage, with phonemes
  - [ ] wordAndImage, with categories
  - [ ] wordAndImage, with phonemes + categories
  - [ ] imageOnly

Layout: grid-3col
  - [ ] wordOnly, no numbers
  - [ ] wordOnly, with numbers
  - [ ] wordAndImage, no numbers
  - [ ] wordAndImage, with numbers
  - [ ] wordAndImage, with phonemes
  - [ ] wordAndImage, with categories
  - [ ] wordAndImage, with phonemes + categories
  - [ ] imageOnly

Layout: flashcards
  - [ ] wordOnly, no numbers
  - [ ] wordOnly, with numbers
  - [ ] wordAndImage, no numbers
  - [ ] wordAndImage, with numbers
  - [ ] wordAndImage, with phonemes
  - [ ] wordAndImage, with categories
  - [ ] wordAndImage, with phonemes + categories
  - [ ] imageOnly

Layout: table
  - [ ] wordOnly, no numbers
  - [ ] wordOnly, with numbers
  - [ ] wordAndImage, no numbers
  - [ ] wordAndImage, with numbers
  - [ ] wordAndImage, with phonemes
  - [ ] wordAndImage, with categories
  - [ ] wordAndImage, with phonemes + categories
  - [ ] imageOnly
```

**Step 2: Test print output**

For each layout:
- Open print preview
- Check: Fonts load (Crimson Pro, Inter)
- Check: Colors render (violet #6C5CE7)
- Check: Gradients appear
- Check: Images load
- Check: Page breaks work
- Check: A4 formatting correct

**Step 3: Test edge cases**

- 0 words (empty list)
- 1 word
- 100 words (multiple pages)
- Words without images
- Words without phonemes
- Words without categories
- SVG images (should convert to PNG)

**Step 4: Document issues**

Create issues for any bugs found:

```bash
# Example
echo "- [ ] Table layout: category column too wide" >> ISSUES.md
```

**Step 5: Commit test results**

```bash
git add ISSUES.md
git commit -m "test(export): comprehensive testing of all layouts

- Tested all layout x display x option combinations
- Documented edge cases
- Verified print preview output"
```

---

## Summary

**Implementation complete when:**
- ✅ All 5 layouts implemented (list-1col, grid-2col, grid-3col, flashcards, table)
- ✅ All 3 display modes supported (wordOnly, imageOnly, wordAndImage)
- ✅ All options supported (date, phonemes, numbers, categories)
- ✅ Professional design with Crimson Pro + Inter fonts
- ✅ Violet #6C5CE7 accent throughout
- ✅ Gradient borders and badges
- ✅ Print-optimized CSS
- ✅ Page-break protection
- ✅ Fallback for unknown layouts
- ✅ Comprehensive testing complete

**Future enhancements (out of scope):**
- PDF export with same design (jsPDF limitations)
- Word export with same design (docx limitations)
- Preview panel in modal (requires React component changes)
