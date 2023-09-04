const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * @swagger
 * /api/addHierarchy:
 *   post:
 *     summary: Add hierarchy configuration
 *     tags:
 *       - Source Config
 *     description: Add a new hierarchy configuration for a specific source
 *     parameters:
 *       - in: query
 *         name: source
 *         required: true
 *         description: The source to which the hierarchy configuration should be added
 *         schema:
 *           type: string
 *       - in: body
 *         name: body
 *         required: true
 *         description: Hierarchy configuration to be added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hierarchy:
 *                   type: array
 *                   items:
 *                     type: string
 *               example:
 *                 hierarchy: ["Union > State > District > SubDistrict > Town / City / Village"]
 *     responses:
 *       '200':
 *         description: Hierarchy configuration added successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Hierarchy configuration added successfully
 *       '400':
 *         description: Invalid source or hierarchy configuration
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request
 *               message: Invalid source or hierarchy configuration
 *       '500':
 *         description: Error updating hierarchy configuration
 *         content:
 *           application/json:
 *             example:
 *               error: Error updating hierarchy configuration
 *               message: There was an error while updating the hierarchy configuration.
 */





router.post('/', async (req, res) => {
    const source = req.query.source;
    const newHierarchy = req.body.hierarchy;

    // Check if source and hierarchy are provided
    if (!source || !newHierarchy || newHierarchy.length === 0) {
        return res.status(400).json({ error: 'Invalid source or hierarchy' });
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
        console.log(sourceData,osid);

        // Update the hierarchy configuration for the specified source
        const hierarchyUrl = `http://localhost:8081/api/v1/SourceConfig/${osid}`;

        // Modify the source configuration
        sourceData.hierarchy.push(newHierarchy);
        console.log(sourceData);
        
          // Convert entityConfig to use the new structure and hierarchy
          const updatedConfig = {
            source: sourceData.source,
            entityFileMap: sourceData.entityFileMap,
            hierarchy: sourceData.hierarchy || [] // Use the provided hierarchy or an empty array
        };
        console.log(updatedConfig);
        
        const updateResponse = await axios.put(hierarchyUrl, updatedConfig);

        if (updateResponse.status === 200) {
            return res.json({ message: 'Hierarchy configuration added successfully' });
        } else {
            return res.status(500).json({ error: 'Error updating hierarchy configuration' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error updating hierarchy configuration' });
    }
});

module.exports = router;
