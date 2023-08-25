const express = require('express');
const fileParser = require('../utility/parser');
const path = require('path');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Define the upload directory

/**
 * @swagger
 * /api/parse:
 *   post:
 *     summary: This is parser API to parse any type of file.
 *     tags: [Basic API]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         description: The file to be parsed.
 *         required: true
 *         type: file
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               data: []
 */
router.post('/', upload.single('file'), async (req, res) => {
  const fileInfo = req.body.file || req.file ;

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
