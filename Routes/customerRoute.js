const express = require("express");
const router = express.Router();
const { createCustomer, getAllCustomer } = require("../Controllers/customer");
const {
  authentication,
  authorization,
} = require("../Middleware/authenticationMiddleware");

// router.route("/").post(createCustomer).get(getAllCustomer);
router
  .route("/")
  .post([authentication, authorization("admin", "user")], createCustomer)
  .get([authentication, authorization("admin", "user")], getAllCustomer);

module.exports = router;
