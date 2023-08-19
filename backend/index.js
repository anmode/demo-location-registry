const express = require('express');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const uploadRoute = require('./routes/upload');
const parseRoute = require('./routes/parse');
const getListRoute = require('./routes/getList');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'Documentation for your APIs',
    },
  },
  apis: ['./routes/*.js'], // Path to your route handlers
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/upload', uploadRoute);
app.use('/api/parse', parseRoute);
app.use('/api/getList', getListRoute);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
