const express = require("express");
const collectionController = require("./../controllers/collectionController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.get(
  "/search-item",
  authController.isLoggedIn,
  collectionController.searchItem
);

router.route("/list").get(authController.isLoggedIn, collectionController.list);

router
  .route("/removemany")
  .delete(authController.isLoggedIn, collectionController.removeMany);

router
  .route("/remove")
  .delete(authController.isLoggedIn, collectionController.remove);

router
  .route("/insertmany")
  .post(authController.isLoggedIn, collectionController.insertMany);

router
  .route("/insert")
  .post(authController.isLoggedIn, collectionController.insert);

module.exports = router;
