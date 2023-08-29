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


// Parameter validation and extraction function
const validateAndExtractParams = (req) => {
  const entityType = req.query.entityType;
  const source = req.query.source.toLowerCase();
  const hierarchy = req.query.hierarchy;

  if (!entityType) {
    throw new Error('Invalid entityType');
  }

  if (!source) {
    throw new Error('Invalid source');
  }

  if (!entityConfig[entityType] || !entityConfig[entityType][source]) {
    throw new Error('Your source does not exist, add your source first');
  }

  return { entityType, source, hierarchy };
};

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { entityType, source, hierarchy } = validateAndExtractParams(req);
    const file = req.file;
    const entityTypeTitleCase = entityType.charAt(0).toUpperCase() + entityType.slice(1);

    // Forward the entire file object to the /parse route for parsing
    const parseResponse = await axios.post('http://localhost:3000/api/parse', {
      file
    });

    // Get the configuration based on entity type and source
    const entityConfigForType = entityConfig[entityTypeTitleCase][source];

    // Inside the processing loop where you prepare data
    const processedData = parseResponse.data.map((item) => {
      const data = {};

      if (!entityConfigForType.keyMap) {
        const errorMessage = 'Entity keyMap is missing or undefined.';
        console.error(errorMessage);
        return { error: errorMessage };
      }


      for (const [key, value] of Object.entries(entityConfigForType.keyMap)) {
        if (!item[value]) {
          const errorMessage = `Value for ${value} is missing in the item.`;
          console.error(errorMessage);
          return { error: errorMessage };
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


    const apiUrl = `http://localhost:8081/api/v1/${entityTypeTitleCase}/invite`;
    const promises = processedData.map(async (data) => {
      try {
        await axios.post(apiUrl, data);
        return { success: true };
      } catch (error) {
        console.log(`Failed to process ${entityTypeTitleCase} with code ${data[entityTypeTitleCase]["code"]}: ${error.message}`);
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
    console.error('Error:', error.message);

    const errorMessage = error.message || 'Error processing the file';
    return res.status(error.status || 500).json({ error: errorMessage });
  }
});

module.exports = router;
