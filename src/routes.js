module.exports = [
  {
    path: "/agol/:id/datasets",
    methods: ["get"],
    handler: "get"
  },
  {
    path: "/agol/:id/datasets/:dataset.:format",
    methods: ["get"],
    handler: "get"
  },
  {
    path: "/agol/:id/datasets/:dataset",
    methods: ["get"],
    handler: "get"
  },
  {
    path: "/agol/:id/datasets/:dataset/:method",
    methods: ["delete"],
    handler: "post"
  },
  {
    path: "/agol/:id/datasets/:dataset/:method",
    methods: ["delete"],
    handler: "delete"
  }
];
