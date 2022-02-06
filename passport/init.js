var signup = require("./signup");
var login = require("./login");
var User = require("../app/models/user");

module.exports = function (passport) {
  // Setting up Passport Strategies for Login and SignUp/Registration
  //login(passport);
  login(passport);
  signup(passport);
};
