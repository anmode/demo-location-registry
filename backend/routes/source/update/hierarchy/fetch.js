const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/getHierarchy:
 *   get:
 *     summary: Get hierarchies for a specific source
 *     tags: [Basic]
 *     description: Get the hierarchies configured for a specific source
 *     parameters:
 *       - in: query
 *         name: source
 *         required: true
 *         description: The source for which to retrieve hierarchies
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Hierarchies retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               hierarchies: ["Union > State > District", "Union > State > District > Subdistrict"]
 *       '400':
 *         description: Invalid source
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request
 *               message: Invalid source
 *       '500':
 *         description: Error fetching hierarchies
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching hierarchies
 *               message: There was an error while fetching hierarchies.
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
        console.log(sourceData);

        // Retrieve hierarchies from the source configuration
        const hierarchies = sourceData.hierarchy || [];

        return res.status(200).json({ hierarchies });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error fetching hierarchies' });
    }
});

module.exports = router;
