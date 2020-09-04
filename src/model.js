require("isomorphic-fetch");

const config = require("config");
const { Service } = require("@ogcapi-js/features");
const services = {};

// Public function to return data from the
// Return: GeoJSON FeatureCollection
//
// URL path parameters:
// req.params.host
// req.params.layer
function getData(req, callback) {
  const {
    params: { id },
  } = req;

  if (id) {
    getCollectionItems(req, callback);
  } else {
    callback(new Error("No collection ID is provided"));
  }
}

async function getCollectionItems(req, callback) {
  const {
    params: { host, id },
  } = req;

  try {
    const service = getService(host);
    const collection = await service.getCollection(id);
    const result = await service.getFeatures(id);

    // construct geojson
    const hostConfig = config["provider-ogcapi-features"].hosts[host];
    const idField = hostConfig.idField ? hostConfig.idField : "";
    const geojson = {
      type: "FeatureCollection",
      features: result.features,
      metadata: {
        name: collection.title,
        description: collection.description,
        idField,
      },
    };

    callback(null, geojson);
  } catch (error) {
    callback(error);
  }
}

function getService(host) {
  if (services[host]) {
    return services[host];
  } else {
    const hostConfig = config["provider-ogcapi-features"].hosts[host];
    const service = new Service({
      baseUrl: hostConfig.url,
    });

    services[host] = service;

    return service;
  }
}

function Model(koop) {}

Model.prototype.getData = getData;

module.exports = Model;
