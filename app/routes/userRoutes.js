const authController = require("./../controllers/authController");
const express = require("express");

const router = express.Router();
module.exports = function (app, passport) {
  app.post(
    "/login",
    passport.authenticate("login", {
      successRedirect: "/#/main?signedIn=true", // redirect to home
      failureRedirect: "/#/login-failure", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  app.post("/signup", authController.signup);

  app.post("/forgot-password", authController.forgotPassword);
  app.get("/reset-password/:token", authController.resetPasswordGet);
  app.post("/reset-password/:token", authController.resetPasswordPost);

  app.get("/profile", authController.isLoggedIn, function (req, res) {
    res.render("profile.ejs", {
      user: req.user, // get the user out of session and pass to template
    }); //
  });

  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/#/login");
  });

  app.get("/currentUser", function (req, res) {
    if (req.isAuthenticated()) {
      var _user = {};
      var _user = req.user;
      console.log("current user: " + req.user);
      res.send(_user);
    } else res.send(null);
  });

  app.get("/auth/github", passport.authenticate("github"));
  app.get("/auth/facebook", passport.authenticate("facebook"));

  app.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/#/login-failure" }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("/#/main?signedIn=true");
    }
  );

  app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/#/login-failure" }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("/#/main?signedIn=true");
    }
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/#/login-failure" }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("/#/main?signedIn=true");
    }
  );
};
