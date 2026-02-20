# Export Modal Feature

## Overview

The Export Modal allows orthophonists to export their word lists as PDF or Word documents with real-time A4 preview, multiple layouts, and full content customization.

## Access Points

1. **From "Ma selection"**: Click "Exporter la liste" button in the selection panel
2. **From saved lists**: Click "..." menu > "Exporter" on any saved list (title is pre-filled with the list name)

## Features

- **Formats**: PDF, Word (.docx)
- **Display Options**: Word only, Image only, Word + Image
- **Layouts**: List (1 col), 2-column grid, 3-column grid, Flashcards, Table
- **Content Options**: Phonemes, categories, syllable count, syllable segmentation, word numbering, date, word count
- **Customization**: Title, subtitle (editable)
- **Preview**: Real-time A4 preview that updates with every setting change
- **Session mode**: When exporting from a session, includes progress bar, color-coded statuses (green/red/gray), and statistics

## Keyboard Shortcuts

- `ESC`: Close export panel
- `Ctrl/Cmd + Enter`: Generate export

## Technical Details

### Components
- `ExportPanel.tsx` — Modal with tabs (Document/Contenu), format selector in footer
- `ExportPreview.tsx` — Real-time A4 preview (HTML/CSS, mirrors PDF output)
- `ExportPdfDocument.tsx` — PDF layout component (`@react-pdf/renderer`)
- `export-utils.ts` — Word (.docx) generation logic

### Libraries
- `@react-pdf/renderer` — Vectorial PDF generation (sharp text, no pixelization)
- `docx` — Word document generation with tables, images, and styling
- `file-saver` — File download trigger

### Architecture
- Modal rendered via `createPortal(jsx, document.body)` to escape CSS stacking contexts
- PDF images (SVG from Supabase) are pre-fetched and converted to PNG base64 via canvas
- Header emoji icons (Twemoji) are pre-fetched as base64 before PDF render
- Font: Sora (WOFF from fontsource CDN, weights 400/700/800)

### Types
- `ExportSettings` — All export configuration (layout, display, content toggles, title, subtitle)
- `ExportPanelProps` — Component props including `words`, `onClose`, `wordStatuses?`, `initialTitle?`
- `ExportFormat` — `'pdf' | 'word'`
- `ExportLayout` — `'list-1col' | 'list-2col' | 'list-3col' | 'cards' | 'table'`
- `ExportDisplay` — `'wordOnly' | 'imageOnly' | 'wordAndImage'`

### Known Constraints
- `@react-pdf/renderer` cannot render SVG — images must be converted to PNG base64 via canvas
- `@react-pdf/renderer` `<Image src="url">` crashes if CDN fetch fails — always pre-fetch as base64
- Sora font has no italic variant — never use `fontStyle: 'italic'` in PDF styles
- Hyphenation disabled for French words (`Font.registerHyphenationCallback(word => [word])`)

## Word Export (.docx) Details

### Table layout
- Header row with violet bottom accent border (6pt, primary color)
- All cells have explicit 4-side borders (1pt, `#E2E8F0`)
- Alternating row shading (`FFFFFF` / `F8FAFC`)
- Session mode adds a status column with color-coded dots

### Image support
- Word images are fetched from Supabase, converted to base64, and embedded as `ImageRun`
- Image size adapts to layout (40x40 for table, 60x60 for cards, etc.)
