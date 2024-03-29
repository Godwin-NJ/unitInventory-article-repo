const express = require("express");
const router = express.Router();
const {
  stockPurchase,
  AllPurchaseDone,
  singlePurchase,
} = require("../Controllers/purchase");
const {
  authentication,
  authorization,
} = require("../Middleware/authenticationMiddleware");

router
  .route("/")
  .post([authentication, authorization("storeKeeper, admin")], stockPurchase)
  .get(AllPurchaseDone);
router.route("/:id").get([authentication], singlePurchase);

module.exports = router;
