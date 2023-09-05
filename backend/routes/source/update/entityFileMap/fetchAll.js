const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/getAllEntityFileTypes:
 *   get:
 *     summary: Get all entityFileType configurations for a specific source
 *     tags: [Basic]
 *     description: Get all entityFileType configurations for a specific source
 *     parameters:
 *       - in: query
 *         name: source
 *         required: true
 *         description: The source for which to retrieve all entityFileType configurations
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: EntityFileType configurations retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               entityFileTypes: 
 *                 - entity: "District Data"
 *                   keyMap:
 *                     entityCode: "DISTRICT"
 *                     name: "District Name"
 *                     higherHierarchy: "State"
 *                 - entity: "City Data"
 *                   keyMap:
 *                     entityCode: "CITY"
 *                     name: "City Name"
 *                     higherHierarchy: "District"
 *       '400':
 *         description: Invalid source
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request
 *               message: Invalid source
 *       '500':
 *         description: Error fetching entityFileType configurations
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching entityFileType configurations
 *               message: There was an error while fetching entityFileType configurations.
 */

router.get('/', async (req, res) => {
    const source = req.query.source;

    // Check if source is provided
    if (!source) {
        return res.status(400).json({ error: 'Invalid source' });
    }

    try {
        // Fetch data from your API based on the provided source
        const apiUrl = `http://localhost:8081/api/v1/SourceConfig/search`;
        const requestBody = {
            offset: 0,
            filters: {
                source: {
                    eq: source
                }
            }
        };
        const response = await axios.post(apiUrl, requestBody);

        if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
            return res.status(400).json({ error: 'Source not found' });
        }

        const sourceData = response.data[0];

        // Retrieve all entityFileType configurations for the specified source
        const entityFileTypes = sourceData.entityFileMap;

        return res.status(200).json({ entityFileTypes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error fetching entityFileType configurations' });
    }
});

module.exports = router;
