const express = require('express');
const axios = require('axios');
const router = express.Router();
const hierarchyConfig = require('../config/hierarchyConfig');

/**
 * @swagger
 * /api/getList/{entityType}:
 *   get:
 *     summary: Get a list of entities based on hierarchy
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         description: The type of entity (e.g., District, State, SubDistrict, Block)
 *         schema:
 *           type: string
 *       - in: query
 *         name: higherHierarchy
 *         required: true
 *         description: The higher hierarchy (eg. State , Union)
 *         schema:
 *           type: string
 *       - in: query
 *         name: higherHierarchyVal
 *         required: true
 *         description: The higher hierarchy value of Entity (e.g., Maharastra, Uttar Pradesh)
 *         schema:
 *           type: string
 *       - in: query
 *         name: hierarchySource
 *         required: true
 *         description: The hierarchy source of Entity (e.g., "State > District > Subdistrict > Town / City / Village")
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               entities: []
 */
router.get('/:entityType', async (req, res) => {
  try {
    const entityType = req.params.entityType;
    const higherHierarchy = req.query.higherHierarchy;
    const higherHierarchyVal = req.query.higherHierarchyVal;
    const hierarchySource = req.query.hierarchySource.toLowerCase();;
    const finalAns = [];


    const higherHierarchyTitleCase = higherHierarchy.charAt(0).toUpperCase() + higherHierarchy.slice(1);
    const entityTypeTitleCase = entityType.charAt(0).toUpperCase() + entityType.slice(1);

    const hierarchyPath = hierarchyConfig[hierarchySource]["hierarchy"].split(' > ');
    const startIndex = hierarchyPath.findIndex(level => level.trim() === higherHierarchyTitleCase);
    const endIndex = hierarchyPath.findIndex(level => level.trim() === entityTypeTitleCase);

    const entities = await fetchEntitiesRecursively(entityType, hierarchyPath, startIndex + 1, endIndex, higherHierarchyVal, hierarchySource, finalAns);

    res.json( entities );
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch list of entities' });
  }
});

async function fetchEntitiesRecursively(entityType, hierarchyPath, currentIndex, endIndex, higherHierarchyVal, hierarchySource, finalAns) {
  if (currentIndex <= endIndex) {
    const hierarchyLevel = hierarchyPath[currentIndex].trim();
    console.log(hierarchyLevel, higherHierarchyVal);
    const listUrl = `http://localhost:8081/api/v1/${hierarchyLevel}/search`;

    const requestBody = {
      offset: 0,
      filters: {
        higherHierarchy: {
          eq: higherHierarchyVal
        },
        source: {
          eq: hierarchySource
        }
      }
    };

    const listResponse = await axios.post(listUrl, requestBody);
    console.log(`Fetched ${listResponse.data.length} entities`);
    const entities = listResponse.data;

    if (currentIndex === endIndex) {
      finalAns.push(...entities);
    }

    currentIndex++;

    for (const entity of entities) {
      await fetchEntitiesRecursively(entityType, hierarchyPath, currentIndex, endIndex, entity.name, hierarchySource, finalAns);
    }
  }

  return finalAns;
}

module.exports = router;
