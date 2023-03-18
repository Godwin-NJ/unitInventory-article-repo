const express = require("express");
const router = express.Router();
const {
  authentication,
  authorization,
} = require("../Middleware/authenticationMiddleware");
const {
  registerUser,
  loginUser,
  updateUser,
} = require("../Controllers/userAuth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router
  .route("/:id")
  .patch([authentication, authorization("admin", "user")], updateUser);

module.exports = router;
