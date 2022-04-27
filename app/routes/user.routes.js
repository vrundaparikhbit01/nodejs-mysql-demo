module.exports = app => {
  var router = require("express").Router();
  const users = require("../controllers/user.controller.js");
  router.post("/register", users.register);
  router.post("/get-otp", users.getOtp);
  router.post("/verify-otp", users.verifyOtp);
  app.use('/api', router);
};