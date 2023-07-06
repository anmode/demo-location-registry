"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var XLSX = require("xlsx");
// Replace 'path/to/spreadsheet.xlsx' with the actual path to your spreadsheet file
var workbook = XLSX.readFile('../../data/state.xlsx');
var worksheet = workbook.Sheets['Sheet1']; // Replace 'Sheet1' with the actual sheet name
// Convert the worksheet data into JSON
var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
console.log(jsonData);
