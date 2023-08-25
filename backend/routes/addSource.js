const express = require('express');
const router = express.Router();
const entityConfig = require('../config/entityConfig');
const fs = require('fs');
const path = require('path'); 

/**
 * @swagger
 * /api/addSource:
 *   put:
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
router.put('/', (req, res) => {
    const entityType = req.query.entityType;
    const source = req.query.source;
    const entityTypeTitleCase = entityType.charAt(0).toUpperCase() + entityType.slice(1);

    // Check if entityType and source are provided
    if (!entityTypeTitleCase || !source) {
        return res.status(400).json({ error: 'Invalid entityType or source' });
    }

    const newSourceConfig = req.body;

    try {
        if (!entityConfig[entityTypeTitleCase]) {
            return res.status(400).json({ error: 'Invalid entityType' });
        }

        // Validate keyMap properties based on the entityType
        const expectedKey = `${entityTypeTitleCase.toLowerCase()}Code`;

        // Continue with the update
        const keyMap = {
            [expectedKey]: newSourceConfig.keyMap.entityCode || '',
            name: newSourceConfig.keyMap.name || '',
            higherHierarchy: newSourceConfig.keyMap.higherHierarchy || ''
        };

        entityConfig[entityTypeTitleCase][source] = { keyMap };

        // Convert entityConfig back to a string and write it to the configuration file
        const updatedConfig = `module.exports = ${JSON.stringify(entityConfig, null, 4)};\n\n`;
        const configFilePath = path.join(__dirname, '..', 'config', 'entityConfig.js'); // Adjust the path as needed
        fs.writeFile(configFilePath, updatedConfig, 'utf8', (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error updating configuration file' });
            }
            return res.json({ message: 'Source updated successfully' });
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error updating configuration' });
    }
});



module.exports = router;
