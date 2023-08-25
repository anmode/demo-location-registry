const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');
const entityConfig = require('../config/entityConfig');
const router = express.Router();

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: This api upload , parse and processed data store into database 
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The file to upload
 *       - in: query
 *         name: entityType
 *         type: string
 *         required: true
 *         description: The type of entity (State , District)
 *       - in: query
 *         name: source
 *         type: string
 *         required: true
 *         description: The source of the data ( eg LGD)
 *       - in: query
 *         name: hierarchy
 *         type: string
 *         description: Provide the Hierarchy If not in file ( Uttar Pradesh is hierarchy if you are uploading list of district of UP)
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               message: File uploaded, parsed, and data processed successfully
 *               success: true
 *               results: []
 */
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract query parameters
    const entityType = req.query.entityType;
    const source = req.query.source.toLowerCase();


    // Validate the entityType and source
    if (!entityType || !source) {
      return res.status(400).json({ error: 'Invalid entityType or source' });
    }

    const hierarchy = req.query.hierarchy;
    const file = req.file;

    // Forward the entire file object to the /parse route for parsing
    const parseResponse = await axios.post('http://localhost:3000/api/parse', {
      file
    });

    // Convert entityType to title case (e.g., 'district' -> 'District')
    const entityTypeTitleCase = entityType.charAt(0).toUpperCase() + entityType.slice(1);

    // Get the configuration based on entity type and source
    const entityConfigForType = entityConfig[entityTypeTitleCase][source];

    // Inside the processing loop where you prepare data
    const processedData = parseResponse.data.map((item) => {
      const data = {};

      // Error handling for missing or undefined entityConfigForType.keyMap
      if (!entityConfigForType.keyMap) {
        console.error('entityConfigForType.keyMap is missing or undefined.');
        return null; // Skip this item and move to the next iteration
      }

      for (const [key, value] of Object.entries(entityConfigForType.keyMap)) {
        if (!item[value]) {
          console.error(`Value for ${value} is missing in the item.`);
          continue; // Skip this key-value pair and move to the next iteration
        }
        data[key] = item[value];
        data.source = source;
      }

      if (item.Hierarchy || item.heirarchy) {
        const hierarchyHeader = item.Hierarchy || item.heirarchy;
        const hierarchyRegex = /([^(/]+)/;
        const match = hierarchyHeader.match(hierarchyRegex);
        if (match) {
          const extractedHierarchy = match[1].trim();
          data.higherHierarchy = extractedHierarchy;
        } else {
          console.error('Failed to extract hierarchy from the header.');
        }
      } else if (hierarchy) {
        data.higherHierarchy = hierarchy;
      }
      

      console.log(data);
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
