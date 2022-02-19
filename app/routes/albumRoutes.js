const express = require("express");
const albumController = require("./../controllers/albumController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post("/add", authController.isLoggedIn, albumController.add);
router.get("/list", authController.isLoggedIn, albumController.list);
router.get("/view", authController.isLoggedIn, albumController.view);
router.get("/view-shared", albumController.viewShared);
router.delete("/delete", authController.isLoggedIn, albumController.delete);
router.patch(
  "/toggle-share",
  authController.isLoggedIn,
  albumController.toggleShare
);
router.get("/shared-list", albumController.sharedList);
module.exports = router;
