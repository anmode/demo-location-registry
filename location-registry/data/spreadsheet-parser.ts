import * as XLSX from 'xlsx';

// Replace 'path/to/spreadsheet.xlsx' with the actual path to your spreadsheet file
const workbook: XLSX.WorkBook = XLSX.readFile('../../data/state.xlsx');
const worksheet: XLSX.WorkSheet = workbook.Sheets['Sheet1'];  // Replace 'Sheet1' with the actual sheet name

// Convert the worksheet data into JSON
const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(jsonData);
