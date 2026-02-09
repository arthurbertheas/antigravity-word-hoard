import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const dataDir = __dirname;
const excelFile = path.join(dataDir, 'Liste refaite v7.xlsx');

console.log(`📂 Analyzing Excel file: ${excelFile}\n`);

// Read Excel file
const workbook = XLSX.readFile(excelFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log(`📊 Sheet name: ${sheetName}`);
console.log(`📏 Range: ${worksheet['!ref']}\n`);

// Get raw data to see structure
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

console.log(`Total rows: ${rawData.length}\n`);

// Show first 5 rows to understand structure
console.log(`First 5 rows:\n`);
for (let i = 0; i < Math.min(5, rawData.length); i++) {
    console.log(`Row ${i + 1}:`, rawData[i].slice(0, 10)); // Show first 10 columns
}

// Try to find the header row
console.log(`\n🔍 Looking for header row...`);
for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    const hasOrtho = row.some(cell => typeof cell === 'string' && cell.toUpperCase() === 'ORTHO');
    if (hasOrtho) {
        console.log(`\n✅ Found header row at index ${i}!`);
        console.log(`Headers:`, row.filter(h => h !== ''));
        break;
    }
}
