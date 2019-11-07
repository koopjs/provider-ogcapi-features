const packageInfo = require("../package");

// Define the provider path
// /:name/:host/:id/FeatureServer/0/:method
// e.g. /servername/FeatureServer/0/query
const provider = {
  type: "provider",
  name: "ogcapi-features",
  version: packageInfo.version,
  hosts: true,
  disableIdParam: false,
  Model: require("./model")
};

module.exports = provider;
