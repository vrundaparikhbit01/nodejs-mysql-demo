module.exports = app => {
  var router = require("express").Router();
  const ipfs = require("../controllers/ipfs.controller.js");
  router.post("/store", ipfs.store);
  router.get("/fetch", ipfs.fetch);
  app.use('/api/ipfs', router);
};