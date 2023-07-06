package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

type Location struct {
    Census2001Code           string `json:"Census 2001 Code"`
    Census2011Code           string `json:"Census2011 Code"`
    SNo                      string `json:"S No"`
    StateLGDCode             string `json:"State LGD Code"`
    StateNameInEnglish       string `json:"State Name (In English)"`
    StateNameInLocalLanguage string `json:"State Name (In Local language)"`
    StateOrUT                string `json:"State or UT"`
    ViewDetails              string `json:"View Details"`
    ViewGovernmentOrder      string `json:"View Government Order"`
    ViewHistory              string `json:"View History"`
    ViewMap                  string `json:"View Map"`
}

func main() {
    // Read the JSON file
    jsonData, err := ioutil.ReadFile("state.json")
    if err != nil {
        fmt.Println("Error reading JSON file:", err)
        return
    }

    // Parse the JSON data
    var locations []Location
    err = json.Unmarshal(jsonData, &locations)
    if err != nil {
        fmt.Println("Error parsing JSON:", err)
        return
    }

    // Create a new file to save the key-value pairs
    file, err := os.Create("output.txt")
    if err != nil {
        fmt.Println("Error creating file:", err)
        return
    }
    defer file.Close()

    // Write the key-value pairs to the file
    for _, loc := range locations {
        fmt.Fprintf(file, "%s: %s\n", loc.StateNameInEnglish, loc.StateOrUT)
    }

    fmt.Println("Key-value pairs saved to output.txt")
}
