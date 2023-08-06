const express = require('express');
const fileParser = require('../utility/parser');

const router = express.Router();

router.post('/', async (req, res) => {
  const filePath = req.body.file.path;

  if (!filePath) {
    return res.status(400).json({ error: 'File path not provided' });
  }

  try {
    const data = await fileParser.parseFileToJSON(filePath);
    return res.json(data);
  } catch (error) {
    return res.status(400).json({ error: 'Error parsing the file: ' + error.message });
  }
});

module.exports = router;
