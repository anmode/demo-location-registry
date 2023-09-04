const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/addSource:
 *   post:
 *     tags: [Source Config]
 *     summary: Update source configuration
 *     description: Update the source configuration for a specific entity type and source
 *     parameters:
 *       - in: query
 *         name: entityType
 *         required: true
 *         description: The type of entity (e.g., District, State)
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         required: true
 *         description: The source of the data (e.g., lgd, otherSource)
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         description: Add your source config to our database
 *         content:
 *           application/json:
 *         schema:
 *           type: object
 *           properties:
 *               keyMap:
 *                 type: object
 *                 properties:
 *                   enitityCode:
 *                     type: string
 *                   name:
 *                     type: string
 *                   higherHierarchy:
 *                     type: string
 *           example:
 *             keyMap:
 *               entityCode: Updated Code (Replace with actual code)
 *               name: Updated Name (In English)
 *               higherHierarchy: Updated Hierarchy
 *     responses:
 *       200:
 *         description: Source configuration updated successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Source updated successfully
 *       400:
 *         description: Invalid entityType, Invalid keyMap properties, or error updating configuration
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request
 *               message: The keyMap properties are not valid for the specified entityType. Make sure to include the correct code property.
 */

// Update source in the configuration
router.post('/', async (req, res) => {
    const entityType = req.query.entityType;
    const source = req.query.source;
    const entityTypeTitleCase = entityType.charAt(0).toUpperCase() + entityType.slice(1);

    // Check if entityType and source are provided
    if (!entityTypeTitleCase || !source) {
        return res.status(400).json({ error: 'Invalid entityType or source' });
    }

    const newSourceConfig = req.body;

    try {
        // Continue with the update
        const keyMap = {
            code: newSourceConfig.keyMap.entityCode || '',
            name: newSourceConfig.keyMap.name || '',
            higherHierarchy: newSourceConfig.keyMap.higherHierarchy || ''
        };


        // Convert entityConfig to use the new structure and hierarchy
        const updatedConfig = {
            source: source,
            entityFileMap: [
                {
                    entity: entityTypeTitleCase,
                    keyMap: keyMap
                }
            ],
            hierarchy: newSourceConfig.hierarchy || [] // Use the provided hierarchy or an empty array
        };



        console.log(updatedConfig);

        // Send the updated source configuration to your API
        const apiUrl = 'http://localhost:8081/api/v1/SourceConfig/invite';
        try {
            await axios.post(apiUrl, updatedConfig);
            return res.json({ message: 'Source updated successfully' });
        } catch (apiError) {
            console.error(apiError);
            return res.status(500).json({ error: 'Error updating source info via API' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error updating configuration' });
    }
});

module.exports = router;
