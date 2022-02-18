const express = require("express");
const collectionController = require("./../controllers/collectionController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.get(
  "/search-item",
  authController.isLoggedIn,
  collectionController.searchItem
);

router
  .route("/create")
  .post(authController.isLoggedIn, collectionController.create);

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

router
  .route("/search")
  .get(authController.isLoggedIn, collectionController.search);

router
  .route("/remoteversion")
  .get(authController.isLoggedIn, collectionController.remoteVersion);

router
  .route("/syncinfo")
  .get(authController.isLoggedIn, collectionController.syncInfo);

module.exports = router;
