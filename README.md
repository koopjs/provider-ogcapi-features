# @koopjs/provider-ogcapi-features

[![npm](https://img.shields.io/npm/v/@koopjs/provider-ogcapi-features)](https://www.npmjs.com/package/@koopjs/provider-ogcapi-features) [![Build Status](https://www.travis-ci.org/koopjs/provider-ogcapi-features.svg?branch=master)](https://www.travis-ci.org/koopjs/provider-ogcapi-features)

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

This provider uses the `:host` and `:id` parameter in the URL to identify the target collection.

The `:host` parameter is the host id defined in the configuration file. In the above example, the user can construct the request URL with the host `cubeserv`.

The `:id` parameter is a collection id from the selected host service. According to the OGCAPI spec, the user can get a list of all collections from the `/collections` request. In the above example, the collection id can be found in

```
http://www.pvretano.com/cubewerx/cubeserv/default/wfs/3.0.0/framework/collections?f=json
```

and `JURISDICTIONAL` is a valid colleciton id.

Then the user is able to fetch the features from this collection with the following URL:

```
/ogcapi-features/cubeserv/JURISDICTIONAL/FeatureServer/0/query
```

The actual data comes from the service request

```
https://eratosthenes.pvretano.com/cubewerx/cubeserv/default/wfs/3.0.0/framework/collections/JURISDICTIONAL/items?f=json
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

## Roadmap

- [ ] Support pagination using the `limit` parameter or prev/next link
- [ ] Support property filtering
