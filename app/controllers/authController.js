// route middleware to make sure a user is logged in

exports.isLoggedIn = function (req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();

  res.send("not authenticated");
};
