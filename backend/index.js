const express = require('express');
const bodyParser = require('body-parser');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const uploadRoute = require('./routes/upload');
const parseRoute = require('./routes/parse');
const getListRoute = require('./routes/getList');
const getInfoByName = require('./routes/getInfoByName');
const getInfoByID = require('./routes/getInfoByLgdId');
const addSource = require('./routes/source/add');
const addHierarchy = require('./routes/source/update/hierarchy/add');
const getAllHierarchies = require('./routes/source/update/hierarchy/fetch');
const getSourceData = require('./routes/source/fetchBySource');
const getAllSourceData = require('./routes/source/fetchAllSourceData');
const addEntityFileType = require('./routes/source/update/entityFileMap/add')
const fetchHierarchy = require('./routes/source/update/hierarchy/fetch');
const fetchEntityFileMap = require('./routes/source/update/entityFileMap/fetch');
const fetchAllEntityFileMap =  require('./routes/source/update/entityFileMap/fetchAll');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Location Master API Pack',
      version: '1.0.0',
      description: 'This is the documentation for APIs related to Location Master Pack',
    },
  },
  apis: ['./routes/**/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/upload', uploadRoute);
app.use('/api/parse', parseRoute);
app.use('/api/getList', getListRoute);
app.use('/api/getInfoByName', getInfoByName);
app.use('/api/getInfoByLgdId', getInfoByID);
app.use('/api/addSource', addSource);
app.use('/api/addHirarchy', addHierarchy);
app.use('/api/getAllHierarchies', getAllHierarchies);
app.use('/api/fetchDataBySource',getSourceData);
app.use('/api/fetchAllSourceData',getAllSourceData);
app.use('/api/addEntityFileType',addEntityFileType);
app.use('/api/fetchHierarchy',fetchHierarchy);
app.use('/api/fetchEntityFileMap',fetchEntityFileMap);
app.use('/api/fetchAllEntityFileMap',fetchAllEntityFileMap);
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
