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

## Current Limitations

- Image display not yet implemented (requires image URL field investigation)
- Flashcards layout pending detailed design
- Detailed table layout pending specification
- Categories and numbering not supported in grid layouts

## Future Enhancements

- Image support in exports
- Flashcards layout implementation
- Detailed table layout
- Save export preferences per user
- Custom templates
- Export to other formats (Excel, CSV)
