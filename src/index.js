// Define the provider path
// /:name/:hosts?/FeatureServer/:layer/:method
// e.g. /servername/FeatureServer/0/query
const provider = {
  type: "provider",
  name: "provider-ogcapi-features",
  version: "0.1.0",
  hosts: true,
  disableIdParam: true,
  Model: require("./model")
  // routes: require('./routes')
};

module.exports = provider;
