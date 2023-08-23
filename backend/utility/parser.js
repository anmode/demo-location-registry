const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { parseString } = require('xml2js');
const yaml = require('js-yaml');
const xlsx = require('xlsx');

async function parseFileToJSON(fileInfo) {
  try {
    const fileExt = path.extname(fileInfo.originalname).toLowerCase();
    const filePath = fileInfo.path;


    switch (fileExt) {
      case '.json':
        return parseJSON(filePath);
      case '.csv':
        return parseCSV(filePath);
      case '.xml':
        return parseXML(filePath);
      case '.yaml':
      case '.yml':
        return parseYAML(filePath);
        case '.xlsx':
          return parseXLSX(filePath);
      default:
        throw new Error('Unsupported file format.');
    }
  } catch (err) {
    throw new Error('Error parsing the file: ' + err.message);
  }
}

function parseJSON(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (parseErr) {
          reject(parseErr);
        }
      }
    });
  });
}

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const parsedData = Papa.parse(data, {
          header: true,
          skipEmptyLines: true,
        });
        resolve(parsedData.data);
      }
    });
  });
}

function parseXML(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        parseString(data, (xmlErr, result) => {
          if (xmlErr) {
            reject(new Error('Error parsing XML: ' + xmlErr.message));
          } else {
            resolve(result);
          }
        });
      }
    });
  });
}

function parseYAML(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const yamlData = yaml.safeLoad(data);
          resolve(yamlData);
        } catch (parseErr) {
          reject(parseErr);
        }
      }
    });
  });
}

function parseXLSX(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheetNameList = workbook.SheetNames;
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]], {
    header: 1
  });


  // Convert array of arrays to array of objects
  const headerRow = data[0];
  // console.log(headerRow);
  const result = data.slice(1).map((row) => {
    const obj = {};
    headerRow.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });

  return result;
}

module.exports = {
  parseFileToJSON,
};
