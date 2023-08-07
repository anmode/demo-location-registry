const express = require('express');
const fileParser = require('../utility/parser');
const path = require('path');

const router = express.Router();

router.post('/', async (req, res) => {
  const fileInfo = req.body.file;

  if (!fileInfo) {
    return res.status(400).json({ error: 'File Information not provided' });
  }

  try {
    const data = await fileParser.parseFileToJSON(fileInfo);
    return res.json(data);
  } catch (error) {
    return res.status(400).json({ error: 'Error parsing the file: ' + error.message });
  }
});

module.exports = router;
