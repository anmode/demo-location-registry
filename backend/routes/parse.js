const express = require('express');
const fileParser = require('../utility/parser');
const path = require('path');

const router = express.Router();

/**
 * @swagger
 * /api/parse:
 *   post:
 *     summary: Parse a file to JSON
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 description: The file information
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               data: []
 */
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
