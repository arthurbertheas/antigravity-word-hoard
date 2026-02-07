const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, 'src', 'data', 'Liste refaite v4.xlsx');
const workbook = XLSX.readFile(excelPath);

console.log('Sheet Names:', workbook.SheetNames);
