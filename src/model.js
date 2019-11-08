const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const config = require("config");
const arcgisParser = require("terraformer-arcgis-parser");
const toBbox = require("@turf/bbox");

const collections = new NodeCache();

// Public function to return data from the
// Return: GeoJSON FeatureCollection
//
// URL path parameters:
// req.params.host
// req.params.layer
function getData(req, callback) {
  const {
    params: { id }
  } = req;

  if (id) {
    getCollectionItems(req, callback);
  } else {
    callback(new Error("No collection ID is provided"));
  }
}

async function getCollectionItems(req, callback) {
  const {
    params: { host, id }
  } = req;
  const hostConfig = config["provider-ogcapi-features"].hosts[host];

  try {
    // construct the request URL
    const collectionId = id;
    const hostURL = hostConfig.url;
    const collection = await getCollection(
      { id: host, url: hostURL },
      collectionId
    );
    const requestURL = new URL(`${hostURL}/collections/${collectionId}/items`);
    requestURL.searchParams.set("f", "json");

    // get request result
    const result = await fetchJSON(requestURL.href);

    // construct geojson
    const idField = hostConfig.idField ? hostConfig.idField : "";
    const geojson = {
      type: "FeatureCollection",
      features: result.features,
      metadata: {
        name: collection.title,
        description: collection.description,
        idField
      }
    };

    callback(null, geojson);
  } catch (error) {
    callback(error);
  }
}

async function getCollection({ id, url }, collectionId) {
  const collectionCacheId = `${id}_${collectionId}`;

  if (collections.has(collectionCacheId)) {
    return collections.get(collectionCacheId);
  }

  const requestURL = new URL(`${url}/collections/${collectionId}`);
  requestURL.searchParams.set("f", "json");

  const result = await fetchJSON(requestURL.href);
  collections.set(collectionCacheId, result);

  return result;
}

async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
}

function Model(koop) {}

Model.prototype.getData = getData;

module.exports = Model;
