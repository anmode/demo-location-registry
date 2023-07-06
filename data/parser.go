package main

import (
	"encoding/json"
	"fmt"
	"github.com/tealeg/xlsx"
	"io/ioutil"
)

func main() {
	// Replace 'path/to/spreadsheet.xlsx' with the actual path to your spreadsheet file
	excelFilePath := "./spreadsheet/state.xlsx"

	// Open the spreadsheet file
	xlFile, err := xlsx.OpenFile(excelFilePath)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}

	// Parse the data from the first sheet
	sheet := xlFile.Sheets[0] // Assuming the data is in the first sheet
	rows := sheet.Rows

	// Create a slice to hold the state data
	var stateData []map[string]interface{}

	// Convert the spreadsheet data into a JSON array
	for i, row := range rows {
		// Skip the header row (assuming it's the first row)
		if i == 0 {
			continue
		}

		rowData := make(map[string]interface{})
		for j, cell := range row.Cells {
			// Get the column header from the header row
			headerCell := sheet.Rows[0].Cells[j]

			rowData[headerCell.String()] = cell.String()
		}

		stateData = append(stateData, rowData)
	}

	// Convert the state data to JSON
	jsonData, err := json.Marshal(stateData)
	if err != nil {
		fmt.Println("Error converting to JSON:", err)
		return
	}

	// Save the JSON data to a file
	err = ioutil.WriteFile("state.json", jsonData, 0644)
	if err != nil {
		fmt.Println("Error writing JSON to file:", err)
		return
	}

	fmt.Println("state.json file created successfully.")
}
