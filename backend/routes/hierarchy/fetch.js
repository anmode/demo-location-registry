const express = require('express');
const hierarchyConfig = require('../../config/hierarchyConfig');
const router = express.Router();

/**
 * @swagger
 * /api/getAllHierarchies:
 *   get:
 *     summary: Get a list of all hierarchies
 *     tags: [Hierarchy API]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               hierarchies:
 *                 - source: lgd
 *                   hierarchy: State > District > Subdistrict > Town / City / Village
 *                 - source: otherSource
 *                   hierarchy: State > District > Town / City / Village > Subdistrict
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
