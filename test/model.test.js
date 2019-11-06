/* eslint-env mocha */

const chai = require("chai");
const proxyquire = require("proxyquire");
const fetchMock = require("fetch-mock");

const expect = chai.expect;
const modulePath = "../src/model";

const PROVIDER_CONFIG = {
  "provider-ogcapi-features": {
    hosts: {
      myhost: {
        url: "https://service-url.com"
      }
    }
  }
};

const COLLECTIONS_RESPONSE = {
  collections: [
    {
      id: "collection_id",
      title: "collection title",
      description: "collection description",
      extent: {
        spatial: {
          bbox: [[1, 2, 3, 4]]
        }
      }
    }
  ]
};

const COLLECTION_ITEMS_RESPONSE = {
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [0, 0]
      },
      properties: {
        time: 123
      }
    }
  ]
};

describe("model", function() {
  it("should throw an error if no layer index is provided", done => {
    const Model = require(modulePath);
    const model = new Model();
    const req = {
      params: {}
    };

    model.getData(req, err => {
      expect(err).to.be.an.instanceOf(Error);
      done();
    });
  });

  it("should return collection items if the layer index is specified", done => {
    const fetch = fetchMock
      .sandbox()
      .mock("https://service-url.com/collections?f=json", COLLECTIONS_RESPONSE)
      .mock(
        "https://service-url.com/collections/collection_id/items?f=json",
        COLLECTION_ITEMS_RESPONSE
      );

    const Model = proxyquire(modulePath, {
      config: PROVIDER_CONFIG,
      "node-fetch": fetch
    });

    const model = new Model();
    const req = {
      params: {
        host: "myhost",
        layer: "0",
        method: "query"
      },
      query: {}
    };

    model.getData(req, (err, geojson) => {
      expect(err).to.equal(null);
      expect(geojson.type).to.equal("FeatureCollection");
      expect(geojson.features).to.be.an("array");
      expect(geojson.features).to.have.lengthOf(1);
      expect(geojson.metadata.name).to.equal("collection title");
      expect(geojson.metadata.description).to.equal("collection description");

      done();
    });
  });
});
