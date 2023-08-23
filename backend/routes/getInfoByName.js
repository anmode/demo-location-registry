const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * @swagger
 * /api/getInfoByName/{entityType}:
 *   get:
 *     summary: Get Info about entity ( State , District , SubDistrict etc) by name
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         description: The type of entity (e.g., State, District, City)
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityTypeVal
 *         required: true
 *         description: The value of the entity type (e.g., Maharashtra, Mumbai)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               entity: {}
 */
router.get('/:entityType', async (req, res) => {
  try {
    const entityType = req.params.entityType;
    const entityTypeVal = req.query.entityTypeVal;
    
    const getUrl = `http://localhost:8081/api/v1/${entityType}/search`;

    const requestBody = {
      offset: 0,
      filters: {
        name: {
          eq: entityTypeVal
        }
      }
    };
    
    const getResponse = await axios.post(getUrl, requestBody);
    
    res.json(getResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entity by name' });
  }
});

module.exports = router;
