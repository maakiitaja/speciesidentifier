const express = require("express");
const collectionController = require("./../controllers/collectionController");
const observationController = require("./../controllers/observationController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/add").post(authController.isLoggedIn, observationController.add);

router.route("/browse").get(observationController.browse);

router
  .route("/getall")
  .get(authController.isLoggedIn, observationController.getAll);

module.exports = router;
