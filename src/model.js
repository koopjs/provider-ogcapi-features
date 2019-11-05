const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const config = require("config");

const collections = new NodeCache();

// Public function to return data from the
// Return: GeoJSON FeatureCollection
//
// URL path parameters:
// req.params.host
// req.params.layer
// req.params.method
function getData(req, callback) {
  const {
    params: { method }
  } = req;

  if (method) {
    getCollectionItems(req, callback);
  } else {
    getCollectionInfo(req, callback);
  }
}

function getCollections(req, callback) {}

async function getCollectionInfo(req, callback) {
  const {
    params: { host, layer }
  } = req;
  const hostConfig = config["provider-ogcapi-features"].hosts[host];

  try {
    const hostURL = hostConfig.url;
    const collection = await getCollection(hostURL, layer);

    // construct geojson
    const idField = hostConfig.idField ? hostConfig.idField : "";
    const geojson = {
      type: "FeatureCollection",
      features: [],
      metadata: {
        name: collection.title,
        extent: [
          [collection.extent.spatial[0], collection.extent.spatial[1]],
          [collection.extent.spatial[2], collection.extent.spatial[3]]
        ],
        idField
      }
    };

    callback(null, geojson);
  } catch (error) {
    callback(error);
  }
}

async function getCollectionItems(req, callback) {
  const {
    params: { host, layer },
    query: { geometry, geometryType }
  } = req;
  const hostConfig = config["provider-ogcapi-features"].hosts[host];

  try {
    // construct the request URL
    const hostURL = hostConfig.url;
    const collection = await getCollection(hostURL, layer);
    const requestURL = new URL(
      `${hostURL}/collections/${collection.name}/items`
    );
    requestURL.searchParams.set("f", "json");

    if (geometryType === "esriGeometryEnvelope") {
      const bbox = getBbox(geometry);
      requestURL.searchParams.set("bbox", bbox);
    }

    // get request result
    const result = await fetchJSON(requestURL.href);

    // construct geojson
    const idField = hostConfig.idField ? hostConfig.idField : "";
    const geojson = {
      type: "FeatureCollection",
      features: result.features,
      metadata: {
        name: collection.title,
        idField
      }
    };

    callback(null, geojson);
  } catch (error) {
    callback(error);
  }
}

async function getCollection(hostURL, index) {
  if (collections.has(index)) {
    return collections.get(index);
  }

  await refreshCollectionCache(hostURL);

  if (collections.has(index)) {
    return collections.get(index);
  }

  throw new Error(`Collection ${index} not found`);
}

async function refreshCollectionCache(hostURL) {
  const requestURL = new URL(`${hostURL}/collections`);
  requestURL.searchParams.set("f", "json");

  const result = await fetchJSON(requestURL.href);
  collections.flushAll();

  for (const [index, collection] of result.collections.entries()) {
    collections.set(index, collection);
  }
}

async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
}

function getBbox(geometry) {
  const parsed = parseGeometry(geometry);

  if (!parsed) {
    return;
  }

  return `${parsed.xmin},${parsed.ymin},${parsed.xmax},${parsed.ymax}`;
}

function parseGeometry(geometry) {
  try {
    return JSON.parse(geometry);
  } catch (error) {
    return;
  }
}

function Model(koop) {}

Model.prototype.getData = getData;
// Model.prototype.getCollections = getCollections

module.exports = Model;
