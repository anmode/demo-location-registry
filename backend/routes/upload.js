const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');
const entityConfig = require('../config/entityConfig'); // Import the configuration file

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract query parameters
    const entityType = req.query.entityType;
    const source = req.query.source;
    const hierarchy = req.query.hierarchy;

    // Validate the entityType, source, and hierarchy
    if (!entityType || !source || !hierarchy) {
      return res.status(400).json({ error: 'Invalid entityType, source, or hierarchy' });
    }

    const file = req.file;

    // Forward the entire file object to the /parse route for parsing
    const parseResponse = await axios.post('http://localhost:3000/api/parse', {
      file, source
    });

    // Convert entityType to title case (e.g., 'district' -> 'District')
    const entityTypeTitleCase = entityType.charAt(0).toUpperCase() + entityType.slice(1);

    // Get the configuration based on entity type and source
    const entityConfigForType = entityConfig[entityTypeTitleCase][source];

    // Prepare data based on entity configuration
    const processedData = parseResponse.data.map((item) => {
      const data = {};
      for (const [key, value] of Object.entries(entityConfigForType.keyMap)) {
        data[key] = item[value];
      }
      data.higherHierarchy = hierarchy; // Add hierarchy to data
      return data;
    });

    // Call the API for each processed data
    const apiUrl = `http://localhost:8081/api/v1/${entityTypeTitleCase}/invite`;
    const promises = processedData.map(async (data) => {
      try {
        await axios.post(apiUrl, data);
        return { success: true };
      } catch (error) {
        console.log(`Failed to process ${entityTypeTitleCase} with code ${data.districtCode}: ${error.message}`);
        return { success: false, error: error.message };
      }
    });
    
    // Wait for all the API calls to finish
    const results = await Promise.all(promises);
    
    // Check if any of the results contain an error
    const hasErrors = results.some((result) => result.success === false);
    
    if (hasErrors) {
      return res.status(500).json({
        message: 'File uploaded and parsed, but there were errors during data processing',
        success: false,
        results: results,
      });
    } else {
      return res.json({
        message: 'File uploaded, parsed, and data processed successfully',
        success: true,
        results: results,
      });
    }
  } catch (error) {
    return res.status(400).json({ error: 'Error processing the file: ' + error.message });
  }
});

module.exports = router;
