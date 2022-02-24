// config/passport.js

// load up the user model
var User = require("../models/user");

// expose this function to our app using module.exports
module.exports = function (passport) {
  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    console.log("in config serializeUser");
    done(null, user._id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    console.log("in config deserializeUser");
    User.findById(id, function (err, user) {
      if (user) user.password = undefined;
      done(err, user);
    });
  });
};
