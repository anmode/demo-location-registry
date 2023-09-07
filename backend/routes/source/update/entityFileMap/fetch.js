const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/getEntityFileMap/{entity}:
 *   get:
 *     summary: Get entityFileType configuration for a specific source and entity
 *     tags: [Basic]
 *     description: Get the entityFileType configuration for a specific source and entity
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         description: The entity for which to retrieve entityFileType configuration
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         required: true
 *         description: The source for which to retrieve entityFileType configuration
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: EntityFileType configuration retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               entityFileType: 
 *                 entity: "District Data"
 *                 keyMap:
 *                   entityCode: "DISTRICT"
 *                   name: "District Name"
 *                   higherHierarchy: "State"
 *       '400':
 *         description: Invalid source or entity
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request
 *               message: Invalid source or entity
 *       '500':
 *         description: Error fetching entityFileType configuration
 *         content:
 *           application/json:
 *             example:
 *               error: Error fetching entityFileType configuration
 *               message: There was an error while fetching entityFileType configuration.
 */

router.get('/:entity', async (req, res) => {
    const source = req.query.source;
    const entity = req.params.entity.toLowerCase();

    const entityTypeTitleCase = entity.charAt(0).toUpperCase() + entity.slice(1);

    // Check if source and entity are provided
    if (!source || !entity) {
        return res.status(400).json({ error: 'Invalid source or entity' });
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

        // Find the entityFileType configuration for the specified entity
        const entityFileType = sourceData.entityFileMap.find((item) => item.entity === entityTypeTitleCase);
        // console.log(entityFileType);

        if (!entityFileType) {
            return res.status(400).json({ error: 'Entity not found' });
        }

        return res.status(200).json(entityFileType);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error fetching entityFileType configuration' });
    }
});

module.exports = router;
