const packageInfo = require("../package");

// Define the provider path
// /:name/:host/FeatureServer/:layer/:method
// e.g. /servername/FeatureServer/0/query
const provider = {
  type: "provider",
  name: "ogcapi-features",
  version: packageInfo.version,
  hosts: true,
  disableIdParam: true,
  Model: require("./model")
};

module.exports = provider;
