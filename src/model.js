const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const config = require("config");

const collections = new NodeCache();
const isRefreshingCollections = {};

// Public function to return data from the
// Return: GeoJSON FeatureCollection
//
// URL path parameters:
// req.params.host
// req.params.layer
function getData(req, callback) {
  const {
    params: { layer }
  } = req;

  if (layer) {
    getCollectionItems(req, callback);
  } else {
    callback(new Error("No layer is provided"));
  }
}

async function getCollectionItems(req, callback) {
  const {
    params: { host, layer },
    query: { geometry, geometryType }
  } = req;
  const hostConfig = config["provider-ogcapi-features"].hosts[host];
  const filtersApplied = {};

  try {
    // construct the request URL
    const hostURL = hostConfig.url;
    const collection = await getCollection({ id: host, url: hostURL }, layer);
    const collectionId = collection.id || collection.name;
    const requestURL = new URL(`${hostURL}/collections/${collectionId}/items`);
    requestURL.searchParams.set("f", "json");

    if (geometryType === "esriGeometryEnvelope") {
      const bbox = getBbox(geometry);
      requestURL.searchParams.set("bbox", bbox);
      filtersApplied.geometry = true;
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
        description: collection.description,
        idField
      },
      filtersApplied
    };

    callback(null, geojson);
  } catch (error) {
    callback(error);
  }
}

async function getCollection({ id, url }, index) {
  const collectionCacheId = `${id}_${index}`;

  if (collections.has(collectionCacheId)) {
    return collections.get(collectionCacheId);
  }

  if (!isRefreshingCollections[id]) {
    isRefreshingCollections[id] = true;

    try {
      await refreshCollectionCache({ id, url });
      isRefreshingCollections[id] = false;
    } catch (error) {
      isRefreshingCollections[id] = false;
      throw error;
    }
  }

  if (collections.has(collectionCacheId)) {
    return collections.get(collectionCacheId);
  }

  throw new Error(`Collection ${index} not found in the host ${id}`);
}

async function refreshCollectionCache({ id, url }) {
  const requestURL = new URL(`${url}/collections`);
  requestURL.searchParams.set("f", "json");

  const result = await fetchJSON(requestURL.href);
  clearCollectionCache(id);

  for (const [layerIndex, collection] of result.collections.entries()) {
    collections.set(`${id}_${layerIndex}`, collection);
  }
}

function clearCollectionCache(hostId) {
  const keys = collections.keys().filter(key => key.startsWith(hostId));
  collections.del(keys);
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

module.exports = Model;
