# Project Documentation: Locations Master Database

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/anmode/demo-location-registry/CI%20Pipeline)
![GitHub issues](https://img.shields.io/github/issues/anmode/demo-location-registry)
![GitHub pull requests](https://img.shields.io/github/issues-pr/anmode/demo-location-registry)
![GitHub](https://img.shields.io/github/license/anmode/demo-location-registry)
![GitHub last commit](https://img.shields.io/github/last-commit/anmode/demo-location-registry)

## Introduction

The aim of this project is to create a "master database" of Indian locations, including Villages, Districts, States, and PIN codes. This database will serve as a centralized and trusted source of location data, eliminating the need for each project to reinvent the wheel and invest resources in data collection from external sources like Post Office or LGD (Local Government Data).

### Key Functionalities

This project encompasses the following pivotal functionalities:

1. **Configuration of Data Source:** In the initial step, users have the ability to configure the data source. This involves defining the hierarchy of the source, specifying the file type, and configuring the file as per the source's specifications.

2. **Uploading Location Data:** After successfully configuring the data source, users can initiate the process of database creation by uploading location data directly from the source.

3. **Querying Location Data:** With the database populated, users are empowered to query the registry, allowing them to extract precise location information. For instance, users can easily query for all districts within a particular state, streamlining access to pertinent location data.

## Usage Examples

Here are some usage examples of how to interact with the product:

### Example 1: Setting up source configuration

This example demonstrates how to add a new data source:

```http
# Sample API Request
POST /api/addSource
```

**Request Body:**

```
{
    "source": "new_source",
    "entityFileMap": [
        {
            "entity": "District",
            "keyMap": {
                "code": "District_Code_789",
                "name": "New District",
                "higherHierarchy": "State > New State"
            }
        },
        {
            "entity": "State",
            "keyMap": {
                "code": "State_Code_789",
                "name": "New State",
                "higherHierarchy": "Country > New Country"
            }
        }
    ],
    "hierarchy": ["Country > New Country > State > New State > District > SubDistrict"]
}
```

This API request adds a new source named "new_source" to the system. It includes the configuration for two entities, District and State, with their respective entity codes, names, and higher hierarchy information. The hierarchy structure is also defined.

**Response:**

```
{
    "message": "New source added successfully"
}

```

There are api now for adding more heirarchy or updating the enity filetype 


### Example 2: Uploading and creating the database
There is upload api it has inbuild parser which can parse any file.

```http
POST /api/upload
```

**Request Parameters:**

- `file` (Type: File, Description: The file to upload)
- `entityType` (Type: String, Required: Yes, Description: The type of entity (e.g., State, District))
- `source` (Type: String, Required: Yes, Description: The source of the data (e.g., LGD))
- `higherHierarchy` (Type: String, Description: Provide the value of Higher Hierarchy if not in the file)



```
POST /api/upload?entityType=District&source=lgd
```

**Response:**

```json
{
    "message": "File uploaded, parsed, and data processed successfully",
    "success": true,
    "results": []
}
```


### Example 3: Querying Location Data

There are various api to query data based on pincode or direct by name

 Retrieve Entities Based on Hierarchy

```http
GET /api/getList/{entityType}
```
**Request Parameters:**

- `entityType` (Type: String, Required: Yes, Description: The type of entity (e.g., District, State, SubDistrict, Block))
- `higherHierarchy` (Type: String, Required: Yes, Description: The higher hierarchy (e.g., State, Union))
- `higherHierarchyVal` (Type: String, Required: Yes, Description: The higher hierarchy value of the entity (e.g., Maharashtra, Uttar Pradesh))
- `hierarchySource` (Type: String, Required: Yes, Description: The hierarchy source of the entity (e.g., "State > District > Subdistrict > Town / City / Village"))



**Example Request:**

```http
GET /api/getList/District?higherHierarchy=State&higherHierarchyVal=Maharashtra&hierarchySource=State > District > Subdistrict > Town / City / Village
```

**Response:**
The API will return a list of District entities within Maharashtra based on the provided hierarchy.

```json
{
    "The result is based on this hierarchy": [
        "State > District > Subdistrict > Town / City / Village"
    ],
    "entities": [...]
}
```

In this example, we query for District entities in Maharashtra using the specified hierarchy source. The response includes the list of entities along with the hierarchy used for the query.