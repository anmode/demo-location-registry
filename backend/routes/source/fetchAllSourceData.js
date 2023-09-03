const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/fetchAllSourceData:
 *   get:
 *     tags: [Source Related API]
 *     summary: Fetch all data based on source
 *     description: Retrieve all data associated with all available sources.
 *     responses:
 *       200:
 *         description: Data retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               data: [
 *                 {
 *                   source: "lgd",
 *                   entity: "Entity1",
 *                   keyMap: {
 *                     code: "Code1",
 *                     name: "Name1",
 *                     higherHierarchy: "Hierarchy1"
 *                   }
 *                 },
 *                 {
 *                   source: "otherSource",
 *                   entity: "Entity2",
 *                   keyMap: {
 *                     code: "Code2",
 *                     name: "Name2",
 *                     higherHierarchy: "Hierarchy2"
 *                   }
 *                 },
 *                 // Add more data objects for other sources as needed
 *               ]
 *       400:
 *         description: Error fetching data or no data available
 *         content:
 *           application/json:
 *             example:
 *               error: Data retrieval error
 *               message: There was an error fetching the data.
 */

// Fetch all source data
router.get('/', async (req, res) => {
    try {
        const requestBody = {
            offset: 0,
            filters: {
            }
          };
        // Fetch all source data from your API
        const apiUrl = `http://localhost:8081/api/v1/SourceConfig/search`;
        const response = await axios.post(apiUrl , requestBody);

        // Extract the data from the API response
        const data = response.data;

        return res.json( data );
    } catch (apiError) {
        console.error(apiError);
        return res.status(500).json({ error: 'Error fetching data via API' });
    }
});

module.exports = router;
