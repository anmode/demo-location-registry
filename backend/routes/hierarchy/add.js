const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path'); 

/**
 * @swagger
 * /api/addHirarchy:
 *   post:
 *     summary: Add hierarchy configuration
 *     tags: [Hierarchy API]
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
 *         schema:
 *           type: object
 *           properties:
 *               hierarchy:
 *                 type: string
 *           example:
 *             hierarchy: "State > District > Subdistrict > Town / City / Village"
 *     responses:
 *       200:
 *         description: Hierarchy configuration added successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Hierarchy configuration added successfully
 *       400:
 *         description: Invalid source or hierarchy configuration
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request
 *               message: Invalid source or hierarchy configuration
 *       500:
 *         description: Error updating hierarchy configuration
 *         content:
 *           application/json:
 *             example:
 *               error: Error updating hierarchy configuration
 *               message: There was an error while updating the hierarchy configuration.
 */

router.post('/', (req, res) => {
    const source = req.query.source;
    const newHierarchyConfig = req.body.hierarchy;

    // Check if source and hierarchy are provided
    if (!source || !newHierarchyConfig) {
        return res.status(400).json({ error: 'Invalid source or hierarchy configuration' });
    }

    try {
        // Update hierarchy configuration in hierarchyConfig.js
        const hierarchyConfigFilePath = path.join(__dirname, '..' , '..', 'config', 'hierarchyConfig.js');
        const hierarchyConfig = require(hierarchyConfigFilePath);

        hierarchyConfig[source] = { hierarchy: newHierarchyConfig };

        // Convert hierarchyConfig back to a string and write it to the configuration file
        const updatedConfig = `module.exports = ${JSON.stringify(hierarchyConfig, null, 4)};\n\n`;
        fs.writeFile(hierarchyConfigFilePath, updatedConfig, 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error updating hierarchy configuration' });
            }
            return res.json({ message: 'Hierarchy configuration added successfully' });
        });
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error updating hierarchy configuration' });
    }
});

module.exports = router;
