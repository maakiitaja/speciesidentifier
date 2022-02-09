var signup = require("./signup");
var login = require("./login");
var User = require("../app/models/user");
var GitHubStrategy = require("passport-github").Strategy;

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
};
