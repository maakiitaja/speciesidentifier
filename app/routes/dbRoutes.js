const express = require("express");
const dbController = require("../controllers/dbController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.get(
  "/populate",
  authController.isLoggedIn,
  authController.restrictTo("admin"),
  dbController.populate
);

router.get(
  "/link-user-to-insects",
  authController.isLoggedIn,
  authController.restrictTo("admin"),
  dbController.linkUserToInsects
);

module.exports = router;
