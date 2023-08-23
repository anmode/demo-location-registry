const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * @swagger
 * /api/getInfoByLgdId/{entityType}:
 *   get:
 *     summary: Get Info about entity ( state , district , sub District etc) by LGD Code
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         description: The type of entity (e.g., State, District, City)
 *         schema:
 *           type: string
 *       - in: query
 *         name: entityLGDCode
 *         required: true
 *         description: The value of the entity LGD code  (e.g., Maharashtra LGD code is 27)
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
    const entityLGDCode = req.query.entityLGDCode;
    
    const getUrl = `http://localhost:8081/api/v1/${entityType}/search`;
    const entityCodeField = `${entityType.toLowerCase()}Code`;
    console.log(entityCodeField);

    const requestBody = {
      offset: 0,
      filters: {
        [entityCodeField]: {
          eq: entityLGDCode
        }
      }
    };
    
    const getResponse = await axios.post(getUrl, requestBody);

    res.json(getResponse.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch entity by LGD code' });
  }
});

module.exports = router;
