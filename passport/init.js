var signup = require("./signup");
var login = require("./login");
var User = require("../app/models/user");
var GitHubStrategy = require("passport-github").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
//var GoogleStrategy = require("passport-google-oauth").Strategy;

module.exports = function (passport) {
  // Setting up Passport Strategies for Login
  //login(passport);
  login(passport);

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:8000/auth/github/callback",
      },
      async function (accessToken, refreshToken, profile, cb) {
        let user;
        try {
          user = await User.findOne({ githubId: profile.id });
          if (!user) {
            user = new User();
            user.githubId = profile.id;
            console.log("profile: ", profile);
            user.username = profile.username;
            console.log("user: " + user);
            user = await user.save({ validateBeforeSave: false });
          }
        } catch (err) {
          return cb(err, user);
        }
        console.log("user: ", user);
        user.username = profile.username;

        return cb(null, user);
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "http://127.0.0.1:8000/auth/facebook/callback",
        profileFields: ["email", "name"],
      },
      async function (accessToken, refreshToken, profile, done) {
        const { email, first_name, last_name } = profile._json;
        let user;
        try {
          console.log("profile:", profile);
          user = await User.findOne({ facebookId: profile.id });
          if (!user) {
            user = new User();
            user.facebookId = profile.id;
            console.log("profile: ", profile);
            user.username = first_name + " " + last_name;
            console.log("user: " + user);
            user = await user.save({ validateBeforeSave: false });
          }
        } catch (err) {
          return done(err, user);
        }
        console.log("user: ", user);
        user.username = first_name + " " + last_name;

        return done(null, user);
      }
    )
  );

  // passport.use(
  //   new GoogleStrategy(
  //     {
  //       consumerKey: process.env.GOOGLE_CONSUMER_KEY,
  //       consumerSecret: process.env.GOOGLE_CONSUMER_SECRET,
  //       returnURL: "http://127.0.0.1:8000/auth/github/callback",
  //     },
  //     async function (accessToken, refreshToken, profile, cb) {
  //       let user;
  //       try {
  //         user = await User.findOne({ googleId: profile.id });
  //         if (!user) {
  //           user = new User();
  //           user.googleId = profile.id;
  //           console.log("profile: ", profile);
  //           user.username = profile.username;
  //           console.log("user: " + user);
  //           user = await user.save({ validateBeforeSave: false });
  //         }
  //       } catch (err) {
  //         return cb(err, user);
  //       }
  //       console.log("user: ", user);
  //       user.username = profile.username;

  //       return cb(null, user);
  //     }
  //   )
  // );
};
