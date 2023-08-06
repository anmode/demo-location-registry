const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const axios = require('axios');

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const file = req.file;

  try {
    // Forward the entire file object to the /parse route for parsing
    const parseResponse = await axios.post('http://localhost:3000/api/parse', {
      file,
    });

    return res.json({
      message: 'File uploaded and parsed successfully',
      data: parseResponse.data,
    });
  } catch (error) {
    return res.status(400).json({ error: 'Error parsing the file: ' + error.message });
  }
});

module.exports = router;
