const express = require('express');
const axios = require('axios');
const router = express.Router();


const HTTP_STATUS = {
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  SUCCESS: 200,
};

const ERROR_MESSAGES = {
  MISSING_PARAMETERS: 'Missing parameters',
  INVALID_HIERARCHY_SOURCE: 'Invalid hierarchy source',
  INVALID_HIERARCHY_LEVELS: 'Invalid hierarchy levels',
  FAILED_TO_FETCH: 'Failed to fetch list of entities',
};

/**
 * @swagger
 * /api/getList/{entityType}:
 *   get:
 *     summary: Get a list of entities based on hierarchy
 *     tags: [Main]
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         description: The type of entity (e.g., District, State, SubDistrict, Block)
 *         schema:
 *           type: string
 *       - in: query
 *         name: higherHierarchy
 *         required: true
 *         description: The higher hierarchy (eg. State , Union)
 *         schema:
 *           type: string
 *       - in: query
 *         name: higherHierarchyVal
 *         required: true
 *         description: The higher hierarchy value of Entity (e.g., Maharastra, Uttar Pradesh)
 *         schema:
 *           type: string
 *       - in: query
 *         name: hierarchySource
 *         required: true
 *         description: The hierarchy source of Entity (e.g., "State > District > Subdistrict > Town / City / Village")
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             example:
 *               entities: []
 */
router.get('/:entityType', async (req, res) => {
  try {

    const { entityType} = req.params;

    function capitalizeString(str) {
      if (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
      return str;
    }
    
    const { higherHierarchy, higherHierarchyVal, hierarchySource } = req.query;
    const entityTypeTitleCase = entityType === 'subdistrict' ? 'SubDistrict' : capitalizeString(entityType);
    const higherHierarchyTitleCase = higherHierarchy === 'subdistrict' ? 'SubDistrict' : capitalizeString(higherHierarchy);
    

    if (!entityTypeTitleCase || !higherHierarchy || !higherHierarchyVal || !hierarchySource) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: ERROR_MESSAGES.MISSING_PARAMETERS });
    }

    console.log(entityTypeTitleCase,hierarchySource,higherHierarchyTitleCase,higherHierarchyVal);
    
    const response = await axios.get(`http://localhost:3000/api/fetchDataBySource?source=${hierarchySource}`);

    // Check if the response status code is 200 (OK)
    if (response.status !== 200) {
      console.error(`Error: Status code ${response.status}`);
      return res.status(response.status).json({ error: 'Error fetching data from source' });
    }

    const sourceInfo = response.data.data[0];
    
    if (!sourceInfo || !sourceInfo.hierarchy || !Array.isArray(sourceInfo.hierarchy) || sourceInfo.hierarchy.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing hierarchy information in source' });
    }

    const hierarchySourceLower = hierarchySource.toLowerCase();
    if (!sourceInfo.hierarchy) {
      return res.status(400).json({ error: 'There is no hierarchy for this source, please add your hierarchy of your source.' });
    }

    const hierarchyPath = sourceInfo.hierarchy[0].split(' > ');
   
      // Create a new hierarchy path array with the relevant levels
      const relevantHierarchyPath = [];
      let foundHigherHierarchy = false;
      let foundEntityType = false;
  
      for (const level of hierarchyPath) {
        const trimmedLevel = level.trim();
  
        if (foundHigherHierarchy) {
          if (trimmedLevel === entityTypeTitleCase) {
            foundEntityType = true;
            relevantHierarchyPath.push(trimmedLevel);
            break;
          } else if (trimmedLevel.includes('/')) {
            // Split the level with '/' and add individual levels
            const subLevels = trimmedLevel.split('/').map(subLevel => subLevel.trim());
            const i = subLevels.findIndex(level => level.trim() === entityTypeTitleCase);
            relevantHierarchyPath.push(subLevels[i]); // Use the index of entityTypeTitleCase to get the correct level
          } else {
            relevantHierarchyPath.push(trimmedLevel);
          }
        }
  
        if (trimmedLevel === higherHierarchyTitleCase) {
          foundHigherHierarchy = true;
        }
      }
    

   

    // const startIndex = hierarchyPath.findIndex(level => level.trim() === higherHierarchyTitleCase);
    // const endIndex = hierarchyPath.findIndex(level => level.trim() === entityTypeTitleCase);

    console.log(sourceInfo,hierarchyPath, relevantHierarchyPath);

    // if (startIndex === -1 || endIndex === -1) {
    //   return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: `${ERROR_MESSAGES.INVALID_HIERARCHY_LEVELS} and Level of this source are ${sourceInfo.hierarchy}` });
    // }
    let currentIndex = 0 ;
    let endIndex = relevantHierarchyPath.length - 1;
    console.log(currentIndex, endIndex);
    const finalAns = await fetchEntitiesRecursively(entityTypeTitleCase, relevantHierarchyPath,currentIndex, endIndex, higherHierarchyVal, hierarchySourceLower, []);
    
    res.json({[`The result is based on this hirarchy`]: hierarchyPath , entities: finalAns });
  } catch (error) {
    console.error('Error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: ERROR_MESSAGES.FAILED_TO_FETCH });
  }
});




async function fetchEntitiesRecursively(entityTypeTitleCase, relevantHierarchyPath, currentIndex, endIndex, higherHierarchyVal, hierarchySource, finalAns) {
  if (currentIndex <= endIndex) {
    const hierarchyLevel = currentIndex === endIndex ? entityTypeTitleCase : relevantHierarchyPath[currentIndex].trim();
    console.log(hierarchyLevel);
    const listUrl = `http://localhost:8081/api/v1/${hierarchyLevel}/search`;

    const requestBody = {
      offset: 0,
      filters: {
        higherHierarchy: {
          eq: higherHierarchyVal
        },
        source: {
          eq: hierarchySource
        }
      }
    };

    const listResponse = await axios.post(listUrl, requestBody);
    console.log(`Fetched ${listResponse.data.length} entities`);
    const entities = listResponse.data;

    if (currentIndex === endIndex) {
      finalAns.push(...entities);
    }

    currentIndex++;

    for (const entity of entities) {
      await fetchEntitiesRecursively(entityTypeTitleCase, relevantHierarchyPath, currentIndex, endIndex, entity.name, hierarchySource, finalAns);
    }
  }

  return finalAns;
}


module.exports = router;
