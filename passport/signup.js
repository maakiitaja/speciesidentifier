var LocalStrategy = require("passport-local").Strategy;
var bCrypt = require("bcryptjs");
var User = require("../app/models/user");

module.exports = function (passport) {
  passport.use(
    "signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      function (req, email, password, done) {
        findOrCreateUser = function () {
          console.log("req.body.username:" + req.body.username);
          const username = req.body.username;

          // find a user in Mongo with provided username
          User.findOne({ email: email }, async function (err, user) {
            // In case of any error return
            if (err) {
              console.log("Error in SignUp: " + err);
              return done(err);
            }
            // already exists
            if (user) {
              console.log("User already exists");

              return done(null, false, { message: "User Already Exists" });
            } else {
              // if there is no user with that email
              // create the user
              var newUser = new User();
              // set the user's local credentials
              newUser.username = username;
              newUser.password = password;
              newUser.password = await newUser.createHash();
              newUser.email = username;

              // save the user
              newUser.save(function (err) {
                if (err) {
                  console.log("Error in Saving user: " + err);
                  throw err;
                }
                console.log("User Registration succesful");
                console.log("user: ", newUser);
                // render the page and pass in any flash data if it exists
                //res.render('profile.ejs', { message: req.flash('loginMessage') });
                return done(null, newUser);
              });
            }
          });
        };

        // Delay the execution of findOrCreateUser and execute
        // the method in the next tick of the event loop
        process.nextTick(findOrCreateUser);
      }
    )
  );
};
