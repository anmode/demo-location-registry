const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/addEntityFileType/{entity}:
 *   post:
 *     summary: Add entityFileType configuration
 *     tags: [Source Config]
 *     description: Add a new entityFileType configuration for a specific source
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         description: The entity to which the entityFileType configuration should be added
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         required: true
 *         description: The source to which the entityFileType configuration should be added
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
 *         description: entityFileType configuration added successfully
 *         content:
 *           application/json:
 *             example:
 *               message: entityFileType configuration added successfully
 *       400:
 *         description: Invalid entity, source, or keyMap configuration
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request
 *               message: Invalid entity, source, or keyMap configuration
 *       500:
 *         description: Error updating entityFileType configuration
 *         content:
 *           application/json:
 *             example:
 *               error: Error updating entityFileType configuration
 *               message: There was an error while updating the entityFileType configuration.
 */




router.post('/:entity', async (req, res) => {
    const source = req.query.source;
    const { keyMap } = req.body;
    const entity = req.params.entity;

    // Check if source, entity, and keyMap are provided
    if (!source || !entity || !keyMap) {
        return res.status(400).json({ error: 'Invalid source, entity, or keyMap' });
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
        const osid = sourceData.osid;
        console.log(sourceData, osid);

        // Update the entityFileType configuration for the specified source
        const entityFileTypeUrl = `http://localhost:8081/api/v1/SourceConfig/${osid}`;

        // Modify the source configuration to add the new entity and keyMap
        sourceData.entityFileMap.push({
            entity,
            keyMap
        });
        console.log(sourceData);

        // Convert sourceData to use the new structure
        const updatedConfig = {
            source: sourceData.source,
            entityFileMap: sourceData.entityFileMap,
            hierarchy: sourceData.hierarchy || [] // Use the existing hierarchy or an empty array
        };
        console.log(updatedConfig);

        const updateResponse = await axios.put(entityFileTypeUrl, updatedConfig);

        if (updateResponse.status === 200) {
            return res.json({ message: 'EntityFileType configuration added successfully' });
        } else {
            return res.status(500).json({ error: 'Error updating entityFileType configuration' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error updating entityFileType configuration' });
    }
});

module.exports = router;
