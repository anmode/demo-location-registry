const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/get/:entityType/:entityId', async (req, res) => {
  try {
    const entityType = req.params.entityType;
    const entityId = req.params.entityId;
    
    const getUrl = `http://localhost:8081/api/v1/${entityType}/${entityId}`;
    
    const getResponse = await axios.get(getUrl);
    
    res.json(getResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entity by ID' });
  }
});

module.exports = router;
