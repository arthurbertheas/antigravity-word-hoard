const XLSX = require('xlsx');
const path = require('path');

// Paths
const excelPath = path.join(__dirname, 'src', 'data', 'Liste refaite v4.xlsx');

// Read the Excel file
const workbook = XLSX.readFile(excelPath);

// Get 'tokens CGP' sheet
const worksheet = workbook.Sheets['tokens CGP'];

// Get raw data
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Print ALL rows
console.log('=== ONGLET "Tokens CGP" - CONTENU COMPLET ===\n');
for (let i = 0; i < rawData.length; i++) {
    console.log(`Row ${i}:`, rawData[i]);
}
