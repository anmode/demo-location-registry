const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/fetchDataBySource:
 *   get:
 *     tags: [Source Related API]
 *     summary: Fetch data based on source
 *     description: Retrieve all data associated with a specific source.
 *     parameters:
 *       - in: query
 *         name: source
 *         required: true
 *         description: The source of the data (e.g., lgd, otherSource)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               data: [
 *                 {
 *                   entity: "Entity1",
 *                   keyMap: {
 *                     code: "Code1",
 *                     name: "Name1",
 *                     higherHierarchy: "Hierarchy1"
 *                   }
 *                 },
 *                 {
 *                   entity: "Entity2",
 *                   keyMap: {
 *                     code: "Code2",
 *                     name: "Name2",
 *                     higherHierarchy: "Hierarchy2"
 *                   }
 *                 },
 *                 // Add more data objects as needed
 *               ]
 *       400:
 *         description: Invalid source or error fetching data
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request
 *               message: The source provided is not valid.
 */

// Fetch data based on source
router.get('/', async (req, res) => {
    const source = req.query.source;

    // Check if the source is provided
    if (!source) {
        return res.status(400).json({ error: 'Invalid source' });
    }

    try {

        const requestBody = {
            offset: 0,
            filters: {
              source: {
                eq: source
              }
            }
          };
        // Fetch data from your API based on the provided source
        const apiUrl = `http://localhost:8081/api/v1/SourceConfig/search`;
        const response = await axios.post(apiUrl, requestBody);

        // Extract the data from the API response
        const data = response.data;

        return res.json({ data });
    } catch (apiError) {
        console.error(apiError);
        return res.status(500).json({ error: 'Error fetching data via API' });
    }
});

module.exports = router;
