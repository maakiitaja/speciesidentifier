var User = require("./../models/user");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const Email = require("../utils/email");
const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

// credits: https://github.com/jonasschmedtmann/complete-node-bootcamp
exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log("forgotPassword start");
  console.log("checking by email", req.query.emailOrUsername);
  // 1) get user
  let user = await User.findOne({ email: req.query.emailOrUsername });
  if (!user) {
    console.log('couldn"t find user by email');
    user = await User.findOne({ username: req.query.emailOrUsername });

    if (!user) {
      console.log('couldn"t find user by username');
      return res
        .status(404)
        .send({ message: "There is no user with email address or username." });
    }
  }
  // 2) Generate the random reset token
  console.log("generating password token.");
  const resetToken = user.createPasswordResetToken();
  console.log("saving user");
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    console.log("sending email");
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;
    console.log("resetUrl: ", resetURL);
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    console.log("mail sending error");
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).send({ message: err });
  }
});

exports.resetPasswordGet = catchAsync(async (req, res, next) => {
  console.log("resetPassword start");

  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return res
      .status(400)
      .send({ message: "Token is invalid or has expired." });
  }
  console.log("req.params.token", req.params.token);
  res.cookie("reset-token", req.params.token, {
    maxAge: user.passwordResetExpires,
  });
  return res.redirect(`${req.protocol}://${req.get("host")}/#/reset-password`);
});

// credits: https://github.com/jonasschmedtmann/complete-node-bootcamp
exports.resetPasswordPost = catchAsync(async (req, res, next) => {
  console.log("resetPassword start");
  console.log(
    "passwordConfirm: ",
    req.query.passwordConfirm,
    "password: ",
    req.query.password
  );
  if (req.query.passwordConfirm !== req.query.password) {
    return res.status(400).send({ message: "Passwords do not match" });
  }

  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return res
      .status(400)
      .send({ message: "Token is invalid or has expired." });
  }
  user.password = req.query.password;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  const hashedPassword = await user.createHash();
  user.password = hashedPassword;
  await user.save();

  return res.send({ message: "Password reset done. Redirecting..." });
});

// route middleware to make sure a user is logged in

exports.isLoggedIn = async function (req, res, next) {
  // if github (or other 3rd party) login, check token expiration
  console.log("Checking token expiration", req.user);

  if (req.user?.githubId) {
    console.log("found github jwt token");
    try {
      let decoded;
      if (req.cookies.githubjwt) {
        decoded = await promisify(jwt.verify)(
          req.cookies.githubjwt,
          process.env.JWT_SECRET
        );
        console.log("decoded:", decoded);
      } else {
        // not authenticated because cookie was not sent
        console.log("req not authenticated");
        req.logout();
        return res.send("not authenticated");
      }
    } catch (err) {
      console.log("err:", err);
      // not authenticated
      console.log("req not authenticated");
      req.logout();
      return res.send("not authenticated");
    }
  }

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();

  res.send("not authenticated");
};

exports.signup = function (req, res, next) {
  console.log("req.query:" + req.query);
  //console.log("req.body" + JSON.stringify(req.body));
  const email = req.query.email;
  const password = req.query.password;
  const passwordConfirm = req.query.passwordConfirm;
  const username = req.query.username;
  console.log("passwordConfirm:", passwordConfirm, "password:", password);

  if (password.length < 4) {
    return res
      .status(400)
      .send({ message: "password length must be at least 4 characters" });
  }

  if (password !== passwordConfirm) {
    return res.status(400).send({ message: "Passwords do not match" });
  }

  // find a user in Mongo with provided username
  User.findOne({ email: email }, async function (err, user) {
    // In case of any error return
    if (err) {
      console.log("Error in SignUp: " + err);
      return res.send({ message: err.message });
    }
    // already exists
    if (user) {
      console.log("User already exists");

      return res.send({ message: "User already exists" });
    } else {
      // if there is no user with that email
      // create the user
      var newUser = new User();
      // set the user's local credentials
      newUser.username = username;
      newUser.password = password;
      newUser.password = await newUser.createHash();
      newUser.email = email;

      // save the user
      newUser.save(function (err) {
        if (err) {
          console.log("Error in Saving user: " + err);
          if (
            typeof err === "string" &&
            (err.contains("Please provide a valid email") ||
              err.contains("password"))
          )
            return res.status(400).send({ message: err });
          else {
            // unique constraint failed for username
            return res.status(422).send({ message: err });
          }
        }
        console.log("User Registration succesful");
        console.log("user: ", newUser);
        newUser.password = undefined;
        return res.send(newUser);
      });
    }
  });
};

// credits: https://github.com/jonasschmedtmann/complete-node-bootcamp
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
