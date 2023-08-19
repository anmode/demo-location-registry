const express = require('express');
const axios = require('axios');
const router = express.Router();



/**
 * @swagger
 * /api/getList/{entityType}:
 *   get:
 *     summary: Get a list of entities
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         description: The type of entity
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
    const listUrl = `http://localhost:8081/api/v1/${entityType}/search`;

    const requestBody = {
      offset: 0,
      filters: {
        // higherHierarchy: {
        //   operators: 'equal',
        //   values: 'uttarPradesh'
        // }
      }
    };
    
    const listResponse = await axios.post(listUrl, requestBody);
    
    res.json(listResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch list of entities' });
  }
});

module.exports = router;
