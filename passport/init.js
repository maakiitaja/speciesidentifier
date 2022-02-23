var login = require("./login");
var User = require("../app/models/user");
var GitHubStrategy = require("passport-github").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
//var GoogleStrategy = require("passport-google-oauth").Strategy;
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

module.exports = function (passport) {
  // Setting up Passport Strategies for Login
  //login(passport);
  login(passport);

  const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.HOST}/auth/github/callback`,
      },
      async function (accessToken, refreshToken, profile, cb) {
        let user;
        console.log("accessToken", accessToken);
        console.log("refreshToken", refreshToken);
        const encodedToken = signToken(accessToken);
        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
          ),
          rolling: true,
          saveUninitialized: true,
          resave: false,
          httpOnly: false,
        };
        console.log("encodedToken", encodedToken);
        const decoded = await promisify(jwt.verify)(
          encodedToken,
          process.env.JWT_SECRET
        );
        console.log("decoded token:", decoded);

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

        // set up token
        user.token = encodedToken;
        user.cookieOptions = cookieOptions;

        return cb(null, user);
      }
    )
  );

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: `${process.env.HOST}/auth/facebook/callback`,
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
  //       returnURL: `${process.env.HOST}/auth/google/callback",
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
