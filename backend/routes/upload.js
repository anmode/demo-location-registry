const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');
const router = express.Router();

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload, parse, and process data and store it into the database
 *     tags: [Main]
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
 *         description: The type of entity (State, District)
 *       - in: query
 *         name: source
 *         type: string
 *         required: true
 *         description: The source of the data (e.g., LGD)
 *       - in: query
 *         name: higherHierarchy
 *         type: string
 *         description: Provide the Value of Higher Hierarchy If not in the file (e.g., Uttar Pradesh is hierarchy if you are uploading a list of districts of UP)
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
  const entityType = req.query.entityType.toLowerCase();
  const source = req.query.source.toLowerCase();
  const higherHierarchy = req.query.higherHierarchy;

  if (!entityType || !source) {
    throw new Error('Invalid entityType or source');
  }
  return { entityType, source, higherHierarchy };
};

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { entityType, source, higherHierarchy } = validateAndExtractParams(req);

    try {
      const response = await axios.get(`http://localhost:3000/api/fetchDataBySource?source=${source}`);

      // Check if the response status code is 200 (OK)
      if (response.status !== 200) {
        console.error(`Error: Status code ${response.status}`);
        return res.status(response.status).json({ error: 'Error fetching data from source' });
      }

      const sourceInfo = response.data.data[0]; // Assuming you want the first item from the response data
      const file = req.file;
      const entityTypeTitleCase = entityType.charAt(0).toUpperCase() + entityType.slice(1);

      // Forward the entire file object to the /parse route for parsing
      const parseResponse = await axios.post('http://localhost:3000/api/parse', {
        file
      });

      // console.log(sourceInfo);
      // Inside the processing loop where you prepare data

  // Inside the processing loop where you prepare data
const processedData = parseResponse.data.map((item) => {
  const data = {};

  const entityConfig = sourceInfo.entityFileMap.find((entityMap) =>
    entityMap.entity.toLowerCase() === entityType.toLowerCase()
  );

  if (!entityConfig) {
    const errorMessage = `No matching entity configuration found for ${entityType}`;
    console.error(errorMessage);
    return { error: errorMessage };
  }

  const keyMap = entityConfig.keyMap;

  if (!keyMap) {
    const errorMessage = 'KeyMap is missing or undefined in entity configuration.';
    console.error(errorMessage);
    return { error: errorMessage };
  }

  for (const [key, value] of Object.entries(keyMap)) {
    if (key === 'osid' || key === 'higherHierarchy') {
      continue; // Skip "osid" and "higherHierarchy" fields
    }
    if (!item[value]) {
      const errorMessage = `Value for ${value} is missing in the item.`;
      console.error(errorMessage);
      // return { error: errorMessage };
    }
    if (key === 'code' ) {
      const entityCodeKey = entityType === 'subdistrict' ? 'subDistrictCode' : `${entityType.toLowerCase()}Code`;
      data[entityCodeKey] = item[value];
      continue;
    }
    
    data[key] = item[value];
  }

  if (item.Hierarchy) {
    const hierarchyHeader = item.Hierarchy || item.hierarchy;
    const hierarchyRegex = /([^(/]+)/;
    const match = hierarchyHeader.match(hierarchyRegex);
    if (match) {
      const extractedHierarchy = match[1].trim();
      data.higherHierarchy = extractedHierarchy;
    } else {
      console.error('Failed to extract hierarchy from the header.');
    }
  } else {
    data.higherHierarchy = higherHierarchy;
    // console.log("hello", higherHierarchy, data.higherHierarchy);
  }

  data.source = source;

  console.log(data); // Log final data with source
  return data;
});



     const apiUrl = `http://localhost:8081/api/v1/${entityType === 'subdistrict' ? 'SubDistrict' : entityTypeTitleCase}/invite`;
      const promises = processedData.map(async (data) => {
        try {
          await axios.post(apiUrl, data);
          return { success: true };
        } catch (error) {
          console.error(`${error.message}`);
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
      console.error(error);
      return res.status(500).json({ error: 'Error making GET request' });
    }
  } catch (error) {
    console.error('Error:', error.message);

    const errorMessage = error.message || 'Error processing the file';
    return res.status(error.status || 500).json({ error: errorMessage });
  }
});

module.exports = router;
