# Export Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement export functionality allowing orthophonists to export word lists directly from "Ma Liste" panel in PDF, Word, or Print format with customizable display and layout options.

**Architecture:** Add ExportPanel component that replaces SelectionTray when triggered, with sidebar for options (ExportOptions), preview area (ExportPreview), and export logic utilities (export-utils.ts). Use existing libraries (jspdf, docx, file-saver) for document generation.

**Tech Stack:** React, TypeScript, jsPDF, docx, file-saver, Tailwind CSS

---

## Task 1: Create Export Types and Interfaces

**Files:**
- Create: `src/types/export.ts`

**Step 1: Write type definitions**

Create the file with export-related TypeScript interfaces:

```typescript
import { Word } from "./word";

export type ExportFormat = 'pdf' | 'word' | 'print';
export type ExportDisplay = 'wordOnly' | 'imageOnly' | 'wordAndImage';
export type ExportLayout = 'list-1col' | 'grid-2col' | 'grid-3col' | 'flashcards' | 'table';

export interface ExportSettings {
  // Affichage
  display: ExportDisplay;

  // Format
  format: ExportFormat;

  // Mise en page
  layout: ExportLayout;

  // Options
  includeDate: boolean;
  includePhonemes: boolean;
  numberWords: boolean;
  includeCategories: boolean;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  display: 'wordOnly',
  format: 'pdf',
  layout: 'list-1col',
  includeDate: true,
  includePhonemes: false,
  numberWords: false,
  includeCategories: false,
};

export interface ExportPanelProps {
  selectedWords: Word[];
  onClose: () => void;
}
```

**Step 2: Commit**

```bash
git add src/types/export.ts
git commit -m "feat(export): add export types and interfaces"
```

---

## Task 2: Create ExportOptions Component (UI Only)

**Files:**
- Create: `src/components/export/ExportOptions.tsx`

**Step 1: Write the component structure**

Create sidebar component with all form sections matching the design:

```typescript
import { useState } from 'react';
import { ExportSettings, DEFAULT_EXPORT_SETTINGS } from '@/types/export';
import { FileText, FileImage, Printer } from 'lucide-react';

interface ExportOptionsProps {
  settings: ExportSettings;
  onChange: (settings: ExportSettings) => void;
}

export function ExportOptions({ settings, onChange }: ExportOptionsProps) {
  const updateSetting = <K extends keyof ExportSettings>(
    key: K,
    value: ExportSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="w-[340px] border-r border-gray-200 px-5 py-6 overflow-y-auto bg-[#FAFBFC]">

      {/* Affichage Section */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-900 mb-2.5 block">
          Affichage <span className="text-red-500">*</span>
        </label>
        <div className="space-y-1.5">
          {(['wordOnly', 'imageOnly', 'wordAndImage'] as const).map((option) => (
            <label
              key={option}
              className={`flex items-center gap-2.5 px-3 py-2.5 border-[1.5px] rounded-lg cursor-pointer transition-all ${
                settings.display === option
                  ? 'border-[#6C5CE7] bg-white'
                  : 'border-gray-200 bg-white hover:border-[#C4B8FF]'
              }`}
            >
              <input
                type="radio"
                name="display"
                value={option}
                checked={settings.display === option}
                onChange={(e) => updateSetting('display', e.target.value as any)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  settings.display === option
                    ? 'border-[#6C5CE7]'
                    : 'border-gray-300'
                }`}
              >
                {settings.display === option && (
                  <div className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {option === 'wordOnly' && 'Mot seul'}
                {option === 'imageOnly' && 'Image seule'}
                {option === 'wordAndImage' && 'Mot + Image'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Mise en page Section */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-900 mb-2.5 block">
          Mise en page <span className="text-red-500">*</span>
        </label>
        <select
          value={settings.layout}
          onChange={(e) => updateSetting('layout', e.target.value as any)}
          className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg font-medium text-sm text-gray-700 focus:border-[#6C5CE7] focus:outline-none bg-white"
        >
          <option value="list-1col">Liste simple (1 colonne)</option>
          <option value="grid-2col">Grille 2 colonnes</option>
          <option value="grid-3col">Grille 3 colonnes</option>
          <option value="flashcards">Flashcards</option>
          <option value="table">Tableau détaillé</option>
        </select>
      </div>

      {/* Options Section */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-900 mb-2.5 block">
          Options <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
          {[
            { key: 'includeDate' as const, label: 'Inclure la date' },
            { key: 'includePhonemes' as const, label: 'Inclure les phonèmes' },
            { key: 'numberWords' as const, label: 'Numéroter les mots' },
            { key: 'includeCategories' as const, label: 'Inclure les catégories' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => updateSetting(key, e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-3.5 h-3.5 border-[1.5px] rounded flex items-center justify-center ${
                  settings[key] ? 'bg-[#6C5CE7] border-[#6C5CE7]' : 'border-gray-300 bg-white'
                }`}
              >
                {settings[key] && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    viewBox="0 0 12 10"
                    fill="none"
                  >
                    <path
                      d="M1 5L4.5 8.5L11 1.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Format Section */}
      <div>
        <label className="text-xs font-semibold text-gray-900 mb-2.5 block">
          Format <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'pdf' as const, icon: FileText, color: 'text-red-500', label: 'PDF' },
            { value: 'word' as const, icon: FileImage, color: 'text-blue-500', label: 'Word' },
            { value: 'print' as const, icon: Printer, color: 'text-green-500', label: 'Imprimer' },
          ].map(({ value, icon: Icon, color, label }) => (
            <label
              key={value}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 border-[1.5px] rounded-lg cursor-pointer transition-all ${
                settings.format === value
                  ? 'border-[#6C5CE7] bg-[#F7F6FE]'
                  : 'border-gray-200 bg-white hover:border-[#C4B8FF]'
              }`}
            >
              <input
                type="radio"
                name="format"
                value={value}
                checked={settings.format === value}
                onChange={(e) => updateSetting('format', e.target.value as any)}
                className="sr-only"
              />
              <Icon className={`w-6 h-6 ${color}`} />
              <span className="text-[11px] font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/export/ExportOptions.tsx
git commit -m "feat(export): create ExportOptions sidebar component"
```

---

## Task 3: Create ExportPreview Component (Static Preview)

**Files:**
- Create: `src/components/export/ExportPreview.tsx`

**Step 1: Write static preview component**

Create preview component that shows a static representation:

```typescript
import { Word } from '@/types/word';
import { ExportSettings } from '@/types/export';

interface ExportPreviewProps {
  words: Word[];
  settings: ExportSettings;
}

export function ExportPreview({ words, settings }: ExportPreviewProps) {
  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 bg-white px-6 py-7 overflow-y-auto">
      {/* Preview Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-gray-900">
          Aperçu <span className="text-xs font-normal text-gray-500">({words.length} mots)</span>
        </div>
        <div className="text-xs text-gray-400">Format A4</div>
      </div>

      {/* Document Preview */}
      <div className="bg-[#FAFBFC] border border-gray-200 rounded-lg p-7 min-h-[400px]">
        {/* Document Header */}
        {settings.includeDate && (
          <div className="pb-3 mb-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Mots à retravailler — {formatDate()}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">{words.length} mots</p>
          </div>
        )}

        {/* Word List Preview */}
        <div className="space-y-2">
          {words.slice(0, 10).map((word, index) => (
            <div key={index} className="flex items-baseline gap-2.5">
              <span className="text-sm font-semibold text-[#6C5CE7]">•</span>
              <div>
                {settings.display !== 'imageOnly' && (
                  <span className="text-sm text-gray-900">{word.MOTS}</span>
                )}
                {settings.includePhonemes && word.PHONEMES && (
                  <span className="text-xs text-gray-500 ml-2">/{word.PHONEMES}/</span>
                )}
                {settings.includeCategories && word.SYNT && (
                  <span className="text-xs text-gray-500 ml-2">({word.SYNT})</span>
                )}
              </div>
            </div>
          ))}
          {words.length > 10 && (
            <div className="text-xs text-gray-400 italic pt-2">
              ... et {words.length - 10} autres mots
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-gray-100 text-[11px] text-gray-400 italic text-center">
          Généré depuis Ressources Orthophonie
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/export/ExportPreview.tsx
git commit -m "feat(export): create ExportPreview component with static preview"
```

---

## Task 4: Create ExportPanel Container Component

**Files:**
- Create: `src/components/export/ExportPanel.tsx`

**Step 1: Write the main panel component**

Create container that combines ExportOptions and ExportPreview:

```typescript
import { useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { ExportSettings, DEFAULT_EXPORT_SETTINGS, ExportPanelProps } from '@/types/export';
import { ExportOptions } from './ExportOptions';
import { ExportPreview } from './ExportPreview';
import { Button } from '@/components/ui/button';

export function ExportPanel({ selectedWords, onClose }: ExportPanelProps) {
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);

  const handleExport = () => {
    // TODO: Implement actual export logic
    console.log('Exporting with settings:', settings);
  };

  return (
    <aside className="shrink-0 bg-white flex flex-col h-full border-l border-gray-200 w-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-2.5">
        <button
          onClick={onClose}
          className="flex-none w-9 h-9 rounded-lg border-[1.5px] border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all"
          title="Retour"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
        </button>
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📥</span>
          <div className="text-base font-semibold text-gray-900">Exporter la liste</div>
        </div>
      </div>

      {/* Body: Options + Preview */}
      <div className="flex-1 flex overflow-hidden">
        <ExportOptions settings={settings} onChange={setSettings} />
        <ExportPreview words={selectedWords} settings={settings} />
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-gray-200 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          Annuler
        </button>
        <Button
          onClick={handleExport}
          className="px-6 py-3 bg-[#6C5CE7] hover:bg-[#5B4CD6] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Générer l'export
        </Button>
      </div>
    </aside>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/export/ExportPanel.tsx
git commit -m "feat(export): create ExportPanel container component"
```

---

## Task 5: Integrate Export Button in SelectionTray

**Files:**
- Modify: `src/components/SelectionTray.tsx`

**Step 1: Add export state and button**

Import ExportPanel and add toggle logic:

```typescript
// Add import at top
import { ExportPanel } from '@/components/export/ExportPanel';
import { FileDown } from 'lucide-react';

// Inside SelectionTray component, add state (around line 26)
const [showExportPanel, setShowExportPanel] = useState(false);

// Add early return after state declarations (around line 162)
if (showExportPanel) {
  return (
    <ExportPanel
      selectedWords={selectedWords}
      onClose={() => setShowExportPanel(false)}
    />
  );
}

// Add export button in footer, before "Lancer la sélection" button (around line 397)
<Button
  className="w-full flex items-center justify-center gap-2 h-[48px] rounded-xl border-2 border-[#6C5CE7] text-[#6C5CE7] bg-white font-semibold text-sm hover:bg-[#F7F6FE] transition-all"
  onClick={() => setShowExportPanel(true)}
  disabled={selectedWords.length === 0}
>
  <FileDown className="w-4 h-4" />
  Exporter la liste
</Button>
```

**Step 2: Test in browser**

Run: `npm run dev`
Expected: Click "Exporter la liste" button shows the export panel

**Step 3: Commit**

```bash
git add src/components/SelectionTray.tsx
git commit -m "feat(export): integrate export button in SelectionTray"
```

---

## Task 6: Create Export Utility - PDF List Layout

**Files:**
- Create: `src/lib/export-utils.ts`

**Step 1: Write PDF export function for list layout**

Create utility function for PDF generation:

```typescript
import jsPDF from 'jspdf';
import { Word } from '@/types/word';
import { ExportSettings } from '@/types/export';

export function exportToPDF(words: Word[], settings: ExportSettings): void {
  const doc = new jsPDF();

  // Document settings
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper to add new page if needed
  const checkPageBreak = () => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Mots à retravailler', margin, yPosition);
  yPosition += 10;

  // Date if enabled
  if (settings.includeDate) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleDateString('fr-FR');
    doc.text(dateStr, margin, yPosition);
    yPosition += 8;
  }

  // Word count
  doc.setFontSize(10);
  doc.text(`${words.length} mots`, margin, yPosition);
  yPosition += 12;

  // Words list
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  words.forEach((word, index) => {
    checkPageBreak();

    let text = '';

    // Number if enabled
    if (settings.numberWords) {
      text += `${index + 1}. `;
    } else {
      text += '• ';
    }

    // Word
    if (settings.display !== 'imageOnly') {
      text += word.MOTS;
    }

    // Phonemes if enabled
    if (settings.includePhonemes && word.PHONEMES) {
      text += ` /${word.PHONEMES}/`;
    }

    // Category if enabled
    if (settings.includeCategories && word.SYNT) {
      text += ` (${word.SYNT})`;
    }

    doc.text(text, margin + 5, yPosition);
    yPosition += lineHeight;
  });

  // Footer
  yPosition = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  doc.text('Généré depuis Ressources Orthophonie', pageWidth / 2, yPosition, {
    align: 'center',
  });

  // Download
  const filename = `mots-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
```

**Step 2: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): add PDF export utility for list layout"
```

---

## Task 7: Create Export Utility - Word Document

**Files:**
- Modify: `src/lib/export-utils.ts`

**Step 1: Add Word export function**

Add function using docx library:

```typescript
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export async function exportToWord(words: Word[], settings: ExportSettings): Promise<void> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: 'Mots à retravailler',
      heading: 'Heading1',
      spacing: { after: 200 },
    })
  );

  // Date if enabled
  if (settings.includeDate) {
    children.push(
      new Paragraph({
        text: new Date().toLocaleDateString('fr-FR'),
        spacing: { after: 100 },
      })
    );
  }

  // Word count
  children.push(
    new Paragraph({
      text: `${words.length} mots`,
      spacing: { after: 300 },
    })
  );

  // Words
  words.forEach((word, index) => {
    const textRuns: TextRun[] = [];

    // Number or bullet
    if (settings.numberWords) {
      textRuns.push(new TextRun(`${index + 1}. `));
    } else {
      textRuns.push(new TextRun('• '));
    }

    // Word
    if (settings.display !== 'imageOnly') {
      textRuns.push(new TextRun({ text: word.MOTS, bold: true }));
    }

    // Phonemes if enabled
    if (settings.includePhonemes && word.PHONEMES) {
      textRuns.push(new TextRun(` /${word.PHONEMES}/`));
    }

    // Category if enabled
    if (settings.includeCategories && word.SYNT) {
      textRuns.push(new TextRun(` (${word.SYNT})`));
    }

    children.push(
      new Paragraph({
        children: textRuns,
        spacing: { after: 100 },
      })
    );
  });

  // Footer
  children.push(
    new Paragraph({
      text: 'Généré depuis Ressources Orthophonie',
      alignment: AlignmentType.CENTER,
      italics: true,
      spacing: { before: 400 },
    })
  );

  // Create document
  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const filename = `mots-${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, filename);
}
```

**Step 2: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): add Word export utility"
```

---

## Task 8: Create Export Utility - Print Function

**Files:**
- Modify: `src/lib/export-utils.ts`

**Step 1: Add print function**

Add function that opens print dialog with styled content:

```typescript
export function exportToPrint(words: Word[], settings: ExportSettings): void {
  // Create print content
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Mots à retravailler</title>
      <style>
        @page {
          margin: 2cm;
        }
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12pt;
          line-height: 1.6;
        }
        h1 {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        .date {
          font-size: 10pt;
          color: #666;
          margin-bottom: 0.3em;
        }
        .count {
          font-size: 10pt;
          margin-bottom: 1.5em;
        }
        .word-list {
          list-style: ${settings.numberWords ? 'decimal' : 'disc'};
          padding-left: 2em;
        }
        .word-list li {
          margin-bottom: 0.5em;
        }
        .phoneme {
          color: #666;
          font-size: 10pt;
        }
        .category {
          color: #666;
          font-size: 10pt;
        }
        .footer {
          margin-top: 2em;
          padding-top: 1em;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 9pt;
          color: #999;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <h1>Mots à retravailler</h1>
  `;

  if (settings.includeDate) {
    html += `<div class="date">${new Date().toLocaleDateString('fr-FR')}</div>`;
  }

  html += `<div class="count">${words.length} mots</div>`;
  html += `<ul class="word-list">`;

  words.forEach((word) => {
    let itemContent = '';

    if (settings.display !== 'imageOnly') {
      itemContent += `<strong>${word.MOTS}</strong>`;
    }

    if (settings.includePhonemes && word.PHONEMES) {
      itemContent += ` <span class="phoneme">/${word.PHONEMES}/</span>`;
    }

    if (settings.includeCategories && word.SYNT) {
      itemContent += ` <span class="category">(${word.SYNT})</span>`;
    }

    html += `<li>${itemContent}</li>`;
  });

  html += `</ul>`;
  html += `<div class="footer">Généré depuis Ressources Orthophonie</div>`;
  html += `</body></html>`;

  // Open print window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): add print export utility"
```

---

## Task 9: Wire Export Logic to ExportPanel

**Files:**
- Modify: `src/components/export/ExportPanel.tsx`

**Step 1: Import and use export utilities**

Update the handleExport function:

```typescript
// Add imports at top
import { exportToPDF, exportToWord, exportToPrint } from '@/lib/export-utils';
import { toast } from 'sonner';

// Replace handleExport function (around line 11)
const handleExport = async () => {
  try {
    switch (settings.format) {
      case 'pdf':
        exportToPDF(selectedWords, settings);
        toast.success('PDF téléchargé avec succès !');
        break;
      case 'word':
        await exportToWord(selectedWords, settings);
        toast.success('Document Word téléchargé avec succès !');
        break;
      case 'print':
        exportToPrint(selectedWords, settings);
        toast.success('Fenêtre d\'impression ouverte');
        break;
    }
  } catch (error) {
    console.error('Export error:', error);
    toast.error('Erreur lors de l\'export. Veuillez réessayer.');
  }
};
```

**Step 2: Test export in browser**

Run: `npm run dev`
Test: Select words → Export → Try each format (PDF, Word, Print)
Expected: Files download or print dialog opens

**Step 3: Commit**

```bash
git add src/components/export/ExportPanel.tsx
git commit -m "feat(export): wire export utilities to ExportPanel"
```

---

## Task 10: Add Grid Layout Support to PDF

**Files:**
- Modify: `src/lib/export-utils.ts`

**Step 1: Enhance PDF export with grid layouts**

Update exportToPDF to support grid layouts:

```typescript
export function exportToPDF(words: Word[], settings: ExportSettings): void {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Add title and header (same as before)
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Mots à retravailler', margin, yPosition);
  yPosition += 10;

  if (settings.includeDate) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('fr-FR'), margin, yPosition);
    yPosition += 8;
  }

  doc.text(`${words.length} mots`, margin, yPosition);
  yPosition += 12;

  // Grid layout handling
  if (settings.layout === 'grid-2col' || settings.layout === 'grid-3col') {
    const cols = settings.layout === 'grid-2col' ? 2 : 3;
    const colWidth = (pageWidth - margin * 2 - (cols - 1) * 10) / cols;
    const cellHeight = 20;
    let currentCol = 0;
    let currentRow = 0;

    words.forEach((word, index) => {
      const x = margin + currentCol * (colWidth + 10);
      const y = yPosition + currentRow * cellHeight;

      // Check page break
      if (y > pageHeight - margin - cellHeight) {
        doc.addPage();
        yPosition = margin;
        currentRow = 0;
      }

      // Draw cell border
      doc.rect(x, y, colWidth, cellHeight);

      // Word text
      doc.setFontSize(11);
      let text = settings.display !== 'imageOnly' ? word.MOTS : '';
      if (settings.includePhonemes && word.PHONEMES) {
        text += `\n/${word.PHONEMES}/`;
      }

      doc.text(text, x + 5, y + 10);

      currentCol++;
      if (currentCol >= cols) {
        currentCol = 0;
        currentRow++;
      }
    });
  } else {
    // List layout (original implementation)
    doc.setFontSize(12);
    const lineHeight = 7;

    words.forEach((word, index) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      let text = settings.numberWords ? `${index + 1}. ` : '• ';
      if (settings.display !== 'imageOnly') text += word.MOTS;
      if (settings.includePhonemes && word.PHONEMES) text += ` /${word.PHONEMES}/`;
      if (settings.includeCategories && word.SYNT) text += ` (${word.SYNT})`;

      doc.text(text, margin + 5, yPosition);
      yPosition += lineHeight;
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  doc.text(
    'Généré depuis Ressources Orthophonie',
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' }
  );

  const filename = `mots-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
```

**Step 2: Test grid layouts**

Run: `npm run dev`
Test: Export with "Grille 2 colonnes" and "Grille 3 colonnes"
Expected: PDF shows words in grid format

**Step 3: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): add grid layout support to PDF export"
```

---

## Task 11: Add Grid Layout Support to Word

**Files:**
- Modify: `src/lib/export-utils.ts`

**Step 1: Enhance Word export with grid layouts**

Update exportToWord to support tables for grid layouts:

```typescript
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';

export async function exportToWord(words: Word[], settings: ExportSettings): Promise<void> {
  const children: Paragraph[] = [];

  // Title and header (same as before)
  children.push(
    new Paragraph({
      text: 'Mots à retravailler',
      heading: 'Heading1',
      spacing: { after: 200 },
    })
  );

  if (settings.includeDate) {
    children.push(
      new Paragraph({
        text: new Date().toLocaleDateString('fr-FR'),
        spacing: { after: 100 },
      })
    );
  }

  children.push(
    new Paragraph({
      text: `${words.length} mots`,
      spacing: { after: 300 },
    })
  );

  // Grid layout
  if (settings.layout === 'grid-2col' || settings.layout === 'grid-3col') {
    const cols = settings.layout === 'grid-2col' ? 2 : 3;
    const rows: TableRow[] = [];

    for (let i = 0; i < words.length; i += cols) {
      const cells: TableCell[] = [];

      for (let j = 0; j < cols; j++) {
        const word = words[i + j];
        if (word) {
          const textRuns: TextRun[] = [];
          if (settings.display !== 'imageOnly') {
            textRuns.push(new TextRun({ text: word.MOTS, bold: true }));
          }
          if (settings.includePhonemes && word.PHONEMES) {
            textRuns.push(new TextRun(`\n/${word.PHONEMES}/`));
          }

          cells.push(
            new TableCell({
              children: [new Paragraph({ children: textRuns })],
              width: { size: 100 / cols, type: WidthType.PERCENTAGE },
            })
          );
        } else {
          cells.push(
            new TableCell({
              children: [new Paragraph('')],
              width: { size: 100 / cols, type: WidthType.PERCENTAGE },
            })
          );
        }
      }

      rows.push(new TableRow({ children: cells }));
    }

    children.push(
      new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  } else {
    // List layout (original implementation)
    words.forEach((word, index) => {
      const textRuns: TextRun[] = [];

      if (settings.numberWords) {
        textRuns.push(new TextRun(`${index + 1}. `));
      } else {
        textRuns.push(new TextRun('• '));
      }

      if (settings.display !== 'imageOnly') {
        textRuns.push(new TextRun({ text: word.MOTS, bold: true }));
      }

      if (settings.includePhonemes && word.PHONEMES) {
        textRuns.push(new TextRun(` /${word.PHONEMES}/`));
      }

      if (settings.includeCategories && word.SYNT) {
        textRuns.push(new TextRun(` (${word.SYNT})`));
      }

      children.push(
        new Paragraph({
          children: textRuns,
          spacing: { after: 100 },
        })
      );
    });
  }

  // Footer
  children.push(
    new Paragraph({
      text: 'Généré depuis Ressources Orthophonie',
      alignment: AlignmentType.CENTER,
      italics: true,
      spacing: { before: 400 },
    })
  );

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const filename = `mots-${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, filename);
}
```

**Step 2: Test grid layouts in Word**

Run: `npm run dev`
Test: Export Word with grid layouts
Expected: Word document shows table with 2 or 3 columns

**Step 3: Commit**

```bash
git add src/lib/export-utils.ts
git commit -m "feat(export): add grid layout support to Word export"
```

---

## Task 12: Manual Testing and Bug Fixes

**Files:**
- Various files as needed

**Step 1: Comprehensive manual testing**

Test checklist:
- [ ] Export with 0 words (should be disabled)
- [ ] Export with 1 word
- [ ] Export with 50+ words
- [ ] All format types (PDF, Word, Print)
- [ ] All display options (wordOnly, imageOnly, wordAndImage)
- [ ] All layout options
- [ ] All checkboxes (date, phonemes, numbering, categories)
- [ ] Return to main panel after export
- [ ] Cancel button works

**Step 2: Fix any bugs found**

Document and fix issues as they arise.

**Step 3: Commit bug fixes**

```bash
git add <files>
git commit -m "fix(export): <description of fix>"
```

---

## Task 13: Add Empty State Handling

**Files:**
- Modify: `src/components/export/ExportPreview.tsx`

**Step 1: Add empty state**

Update ExportPreview to show message when no words:

```typescript
// Add at the beginning of the return statement
if (words.length === 0) {
  return (
    <div className="flex-1 bg-white px-6 py-7 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <p className="text-sm">Aucun mot sélectionné</p>
        <p className="text-xs mt-2">Sélectionnez des mots pour voir l'aperçu</p>
      </div>
    </div>
  );
}
```

**Step 2: Test empty state**

Run: `npm run dev`
Test: Open export panel with no words selected
Expected: Shows empty state message

**Step 3: Commit**

```bash
git add src/components/export/ExportPreview.tsx
git commit -m "feat(export): add empty state to preview"
```

---

## Task 14: Optimize Preview Performance

**Files:**
- Modify: `src/components/export/ExportPreview.tsx`

**Step 1: Add useMemo for preview content**

Optimize rendering with React.useMemo:

```typescript
import { useMemo } from 'react';

// Inside component, before return
const previewWords = useMemo(() => {
  return words.slice(0, 10);
}, [words]);

// Update the map to use previewWords instead of words.slice(0, 10)
```

**Step 2: Test performance**

Test with large word lists (100+ words)
Expected: Preview updates smoothly when changing options

**Step 3: Commit**

```bash
git add src/components/export/ExportPreview.tsx
git commit -m "perf(export): optimize preview rendering with useMemo"
```

---

## Task 15: Add Keyboard Shortcuts

**Files:**
- Modify: `src/components/export/ExportPanel.tsx`

**Step 1: Add keyboard event handlers**

Add Escape and Ctrl/Cmd+Enter shortcuts:

```typescript
import { useEffect } from 'react';

// Inside component, add effect
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // ESC to close
    if (e.key === 'Escape') {
      onClose();
    }
    // Ctrl/Cmd + Enter to export
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleExport();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [onClose, handleExport]);
```

**Step 2: Test keyboard shortcuts**

Run: `npm run dev`
Test: ESC closes panel, Ctrl+Enter triggers export
Expected: Shortcuts work as expected

**Step 3: Commit**

```bash
git add src/components/export/ExportPanel.tsx
git commit -m "feat(export): add keyboard shortcuts (ESC, Ctrl+Enter)"
```

---

## Task 16: Documentation and Final Cleanup

**Files:**
- Create: `docs/features/export-modal.md`
- Modify: `README.md` (if applicable)

**Step 1: Write feature documentation**

Create documentation file:

```markdown
# Export Modal Feature

## Overview

The Export Modal allows orthophonists to export their selected word lists directly without saving them first.

## Features

- **Formats**: PDF, Word (.docx), Print
- **Display Options**: Word only, Image only, Word + Image
- **Layouts**: List, 2-column grid, 3-column grid, Flashcards, Detailed table
- **Options**: Include date, phonemes, word numbering, categories

## Usage

1. Select words from the word explorer
2. Click "Exporter la liste" button in "Ma Liste" panel
3. Configure export options in sidebar
4. Preview changes in real-time
5. Click "Générer l'export" to download/print

## Keyboard Shortcuts

- `ESC`: Close export panel
- `Ctrl/Cmd + Enter`: Generate export

## Technical Details

- **Components**: ExportPanel, ExportOptions, ExportPreview
- **Libraries**: jsPDF (PDF), docx (Word), file-saver (downloads)
- **State**: Local React state for export settings

## Future Enhancements

- Image support in exports
- Flashcards layout implementation
- Detailed table layout
- Save export preferences per user
- Custom templates
```

**Step 2: Update design document**

Mark implementation as complete in design doc:

```markdown
**Approbation :**
- [x] Design UX validé
- [x] Architecture technique validée
- [x] Implémentation ✅ (2026-02-15)
```

**Step 3: Commit documentation**

```bash
git add docs/features/export-modal.md docs/plans/2026-02-15-export-modal-design.md
git commit -m "docs: add export modal feature documentation"
```

---

## Success Criteria Verification

After completing all tasks, verify:

- ✅ Export button appears in SelectionTray
- ✅ Export panel replaces SelectionTray when clicked
- ✅ All form options update preview in real-time
- ✅ PDF export works with all layouts
- ✅ Word export works with all layouts
- ✅ Print dialog opens with styled content
- ✅ All options (date, phonemes, etc.) appear in exports
- ✅ Return button brings back SelectionTray
- ✅ Keyboard shortcuts work
- ✅ UI matches design mockup

---

## Notes

**Out of Scope for Initial Implementation:**

1. **Image Support**: The Word type doesn't have a direct IMAGE_URL field. The optional "image associée" field needs investigation. Image export will be implemented in a follow-up task once we confirm the image data structure.

2. **Flashcards Layout**: Complex layout requiring separate implementation pass.

3. **Detailed Table Layout**: Requires additional design specification.

4. **Export Preferences**: User preference persistence for export settings.

These features are documented in the design doc (Section 9: Évolutions Futures) and can be tackled in subsequent iterations.
