const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.file;

  try {
    // Forward the entire file object to the /parse route for parsing
    const parseResponse = await axios.post('http://localhost:3000/api/parse', {
      file,
    });

    // Extract entityType from the query parameters
    const entityType = req.query.entityType;
    const hierarchy = req.query.heirarchy;

    // Validate the entityType and hierarchy
    if (!entityType || !hierarchy) {
      return res.status(400).json({ error: 'Invalid entityType or hierarchy' });
    }

    // Check if entityType is "district"
    if (entityType === 'District') {
      const districts = parseResponse.data.map((item) => ({
        districtCode: item['District LGD Code'],
        name: item['District Name (In English)'],
        hierarchy: hierarchy,
      }));

      // Call the API for each district
      const apiUrl = `http://localhost:8081/api/v1/${entityType}/invite`;
      const promises = districts.map(async (district) => {
        try {
          const response = await axios.post(apiUrl, district);
        } catch (error) {
          return { error: `Failed to invite district with code ${district.districtCode}` };
        }
      });

      // Wait for all the API calls to finish
      const results = await Promise.all(promises);

      return res.json({
        message: 'File uploaded, parsed, and data processed successfully',
        results: results,
      });
    }

    return res.json({
      message: 'File uploaded and processed successfully',
    });
  } catch (error) {
    return res.status(400).json({ error: 'Error parsing the file: ' + error.message });
  }
});

module.exports = router;
