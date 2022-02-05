const authController = require("./../controllers/authController");

module.exports = function (app, passport) {
  app.post(
    "/login",
    passport.authenticate("login", {
      successRedirect: "/#/main", // redirect to the secure profile section
      failureRedirect: "/#/login-failure", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );
  app.post(
    "/signup",
    passport.authenticate("signup", {
      successRedirect: "/#/main", // redirect to the secure profile section
      failureRedirect: "/#/signup-failure", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

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
};
