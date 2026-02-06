const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Paths
const excelPath = path.join(__dirname, 'src', 'data', 'Liste refaite v4.xlsx');
const outputPath = path.join(__dirname, 'src', 'data', 'words_new.json');

// Read the Excel file
const workbook = XLSX.readFile(excelPath);

// Get the first sheet (liste)
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON (headers are now correctly in row 0)
const rawData = XLSX.utils.sheet_to_json(worksheet);

// Map column names to match existing word.ts interface
const columnMapping = {
    'MOTS': 'ORTHO',
    'GPMaTCH': 'GPMATCH',
    'progression graphèmes': 'code graphèmes',
    'progression structure': 'code structure',
    'GRAPHEMES': 'GSEG',
    'PHONEMES': 'PSEG'
};

// Transform the data
const transformedData = rawData.map((row, index) => {
    const word = {};

    for (const [key, value] of Object.entries(row)) {
        // Map column name if mapping exists
        const mappedKey = columnMapping[key] || key;

        // Convert value to string (for consistency with existing data)
        word[mappedKey] = value != null ? String(value) : '';
    }

    return word;
});

// Filter out any rows without ORTHO
const validWords = transformedData.filter(w => w.ORTHO && w.ORTHO.trim().length > 0);

console.log(`Total rows in Excel: ${rawData.length}`);
console.log(`Valid words after transformation: ${validWords.length}`);
console.log(`\nSample word (first):`, JSON.stringify(validWords[0], null, 2));
console.log(`\nSample word (last):`, JSON.stringify(validWords[validWords.length - 1], null, 2));

// Write to output file
fs.writeFileSync(outputPath, JSON.stringify(validWords, null, 4), 'utf8');
console.log(`\n✅ Output written to: ${outputPath}`);
