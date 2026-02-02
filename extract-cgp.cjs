const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Paths
const excelPath = path.join(__dirname, 'src', 'data', 'Liste refaite v3.xlsx');
const outputPath = path.join(__dirname, 'src', 'data', 'cgp-tokens.json');

// Read the Excel file
const workbook = XLSX.readFile(excelPath);

// Get 'tokens CGP' sheet
const worksheet = workbook.Sheets['tokens CGP'];
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Build structured data
const cgpTokens = {
    consonnes: {},
    voyelles: {},
    muettes: []
};

// Parse CONSONNES (left side, columns 0-5)
// Parse VOYELLES (right side, columns 7-18)
// Parse MUETTES (column 19-20)

for (let i = 4; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;

    // CONSONNES (columns 0-5)
    const consPhoneme = row[0]; // e.g., "/f/"
    const consToken = row[1];   // e.g., ".f"
    const consGraphemes = [];
    for (let j = 2; j <= 5; j++) {
        if (row[j] && row[j] !== '#') consGraphemes.push(row[j]);
    }
    if (consPhoneme && consToken && consGraphemes.length > 0) {
        cgpTokens.consonnes[consToken] = {
            phoneme: consPhoneme,
            graphemes: consGraphemes
        };
    }

    // VOYELLES (columns 7-18)
    const vowPhoneme = row[7];  // e.g., "/a/"
    const vowToken = row[8];    // e.g., ".a"
    const vowGraphemes = [];
    for (let j = 9; j <= 18; j++) {
        if (row[j] && row[j] !== '#') vowGraphemes.push(row[j]);
    }
    if (vowToken && vowGraphemes.length > 0) {
        cgpTokens.voyelles[vowToken] = {
            phoneme: vowPhoneme || '',
            graphemes: vowGraphemes
        };
    }

    // MUETTES (columns 19-20)
    const muetPhoneme = row[19];
    const muetGrapheme = row[20];
    if (muetPhoneme === '#' && muetGrapheme) {
        cgpTokens.muettes.push(muetGrapheme);
    }
}

// Create lookup maps for easier use
const output = {
    consonnes: cgpTokens.consonnes,
    voyelles: cgpTokens.voyelles,
    muettes: cgpTokens.muettes,
    // Reverse lookup: grapheme -> type
    graphemeToType: {}
};

// Build reverse lookup
for (const [token, data] of Object.entries(cgpTokens.consonnes)) {
    for (const g of data.graphemes) {
        output.graphemeToType[g.toLowerCase()] = 'consonne';
    }
}
for (const [token, data] of Object.entries(cgpTokens.voyelles)) {
    for (const g of data.graphemes) {
        output.graphemeToType[g.toLowerCase()] = 'voyelle';
    }
}
for (const g of cgpTokens.muettes) {
    output.graphemeToType[g.toLowerCase()] = 'muette';
}

console.log('=== CGP TOKENS EXTRACTED ===');
console.log(`Consonnes: ${Object.keys(output.consonnes).length} tokens`);
console.log(`Voyelles: ${Object.keys(output.voyelles).length} tokens`);
console.log(`Muettes: ${output.muettes.length} entries`);
console.log(`Total grapheme mappings: ${Object.keys(output.graphemeToType).length}`);

// Write output
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`\n✅ Written to: ${outputPath}`);
