const express = require("express");
const dbController = require("../controllers/dbController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.get("/populate", authController.isLoggedIn, dbController.populate);

module.exports = router;
