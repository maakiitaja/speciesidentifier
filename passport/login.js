var LocalStrategy = require("passport-local").Strategy;
var User = require("../app/models/user");
var bCrypt = require("bcryptjs");

module.exports = function (passport) {
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      function (req, username, password, done) {
        // check in mongo if a user with username exists or not
        console.log("email:" + username);
        console.log("password:" + password);

        User.findOne({ email: username }, async function (err, user) {
          // In case of any error, return using the done method
          if (err) return done(err);
          // Username does not exist, log the error and redirect back
          if (!user) {
            console.log("User Not Found with username " + username);
            return done(null, false, { message: "User Not found." });
          }
          // User exists but wrong password, log the error
          if (!(await user.isValidPassword(password))) {
            console.log("Invalid Password");
            return done(null, false, { message: "Invalid Password" }); // redirect back to login page
          }
          // User and password both match, return user from done method
          // which will be treated like success
          return done(null, user);
        });
      }
    )
  );

  isValidPassword = async function (user, password) {
    return await bCrypt.compare(password, user.password);
  };
};
