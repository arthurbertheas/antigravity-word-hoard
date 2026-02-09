import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const dataDir = __dirname;
const excelFile = path.join(dataDir, 'Liste refaite v7.xlsx');
const jsonFile = path.join(dataDir, 'words.json');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupFile = path.join(dataDir, `words_backup_${timestamp}.json`);

console.log(`📂 Reading Excel file: ${excelFile}`);

// Read Excel file
const workbook = XLSX.readFile(excelFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Get raw data as array of arrays
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });

console.log(`✅ Total rows: ${rawData.length}`);

// First row should be headers
const headers = rawData[0];
console.log(`\n📋 Headers (row 1):`, headers);

// Rest are data rows
const dataRows = rawData.slice(1);

// Convert to array of objects
const data = dataRows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
        // Use header as key, or skip if empty
        if (header && header.trim() !== '') {
            obj[header] = row[index] || '';
        }
    });
    return obj;
});

console.log(`\n✅ Converted ${data.length} data rows`);

// Show columns
if (data.length > 0) {
    console.log(`\n📋 Columns in output:`);
    const columns = Object.keys(data[0]);
    columns.forEach((col, i) => {
        console.log(`  ${i + 1}. ${col}`);
    });
}

// Create backup of current words.json
if (fs.existsSync(jsonFile)) {
    console.log(`\n💾 Creating backup: ${path.basename(backupFile)}`);
    fs.copyFileSync(jsonFile, backupFile);
}

// Write to JSON file
console.log(`\n💾 Writing to ${path.basename(jsonFile)}`);
fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2), 'utf-8');

console.log(`\n✅ Conversion complete!`);
console.log(`   - Total words: ${data.length}`);
console.log(`   - Backup saved: ${path.basename(backupFile)}`);
console.log(`   - New file: ${path.basename(jsonFile)}`);

// Show sample of first word
if (data.length > 0) {
    console.log(`\n📝 Sample (first word):`);
    const sample = data[0];
    const keys = Object.keys(sample);
    keys.forEach(key => {
        const value = sample[key];
        if (value !== '') {
            console.log(`   ${key}: ${value}`);
        }
    });
}
