# @koopjs/provider-ogcapi-features

[![npm (scoped)](https://img.shields.io/npm/v/koopjs/provider-ogcapi-features)](https://www.npmjs.com/package/@koopjs/provider-ogcapi-features) [![Build Status](https://www.travis-ci.org/koopjs/provider-ogcapi-features.svg?branch=master)](https://www.travis-ci.org/koopjs/provider-ogcapi-features)

Experimental Koop provider for [OGC API - Features](https://github.com/opengeospatial/ogcapi-features)

## Installation

```bash
npm install @koopjs/provider-ogcapi-features
```

## Configuration

The configuration of this provider is defined under the `provider-ogcapi-features` namespace. You can update the configuration file for the Koop app to configure this plugin.

```javascript
{
  "provider-ogcapi-features": {
    // the "hosts" object defines a list of hosts that exposes OGC Features API
    "hosts": {
      // each host has a unique id, which will be used in the request URL
      "host_id": {
        // host URL
        "url": "https://server-url.com",
        // optional, the name of ID field in the feature properties
        "idField": "id_field_name"
      }
    }
  }
}
```

For example, the following configuration specifies that a host `cubeserv` with the host URL.

```json
{
  "provider-ogcapi-features": {
    "hosts": {
      "cubeserv": {
        "url": "http://www.pvretano.com/cubewerx/cubeserv/default/wfs/3.0.0/framework"
      }
    }
  }
}
```

Then the user is able to fetch the features with the following URL:

```
/ogcapi-features/cubeserv/FeatureServer/0/query
```

## Usage

This provider can be registered in a Koop app.

```javascript
const Koop = require("koop");
const ogcProvider = require("@koopjs/provider-ogcapi-features");

Koop.register(ogcProvider);
```

If the app is developed using the [Koop CLI](https://github.com/koopjs/koop-cli), it can be auto-registered with

```bash
koop add @koopjs/provider-ogcapi-features
```
