var User = require("./../models/user");

// route middleware to make sure a user is logged in

exports.isLoggedIn = function (req, res, next) {
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

  if (password !== passwordConfirm) {
    return res.send({ message: "Passwords do not match" });
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
