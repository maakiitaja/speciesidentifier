const express = require("express");
const insectController = require("./../controllers/insectController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.get("/search", insectController.search);
router.get("/load-insects-by-user", insectController.loadInsectsByUser);
router.get("/latin-name-exists", insectController.latinNameExists);
router.get("/add-latin-name", insectController.addLatinName);

router
  .route("/delete")
  .delete(authController.isLoggedIn, insectController.delete);

router
  .route("/insert")
  .post(authController.isLoggedIn, insectController.insert);

router
  .route("/upload-list")
  .get(authController.isLoggedIn, insectController.uploadList);

module.exports = router;
