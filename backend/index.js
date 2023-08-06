const express = require('express');
const bodyParser = require('body-parser');
const uploadRoute = require('./routes/upload');
const parseRoute = require('./routes/parse');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use('/api/upload', uploadRoute);
app.use('/api/parse', parseRoute);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
