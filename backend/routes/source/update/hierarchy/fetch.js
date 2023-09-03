const express = require('express');
const hierarchyConfig = require('../../../../config/hierarchyConfig');
const router = express.Router();

/**
 * @swagger
 * /api/getAllHierarchiesBySource:
 *   get:
 *     tags: [Hierarchy Related API]
 *     summary: Get all hierarchies of a particular source
 *     description: Retrieve all hierarchy entries associated with a specific source.
 *     parameters:
 *       - in: query
 *         name: source
 *         required: true
 *         description: The source to retrieve hierarchies for (e.g., lgd, otherSource)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hierarchies retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               data: [
 *                 {
 *                   hierarchyName: "Hierarchy1",
 *                   description: "Description1"
 *                 },
 *                 {
 *                   hierarchyName: "Hierarchy2",
 *                   description: "Description2"
 *                 },
 *                 // Add more hierarchy entries as needed
 *               ]
 *       400:
 *         description: Invalid source or error fetching hierarchies
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid request
 *               message: There was an error fetching hierarchies for the source.
 */

router.get('/', (req, res) => {
  const hierarchies = Object.keys(hierarchyConfig).map(source => {
    return {
      source,
      hierarchy: hierarchyConfig[source].hierarchy
    };
  });

  res.json({ hierarchies });
});

module.exports = router;
