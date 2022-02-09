// app.js

/// get all the tools we need
var express = require("express");
var app = express();
var AppError = require("./app/utils/appError");

//++++
var path = require("path");
var favicon = require("serve-favicon");
//++++

var port = process.env.PORT || 8000;
var mongoose = require("mongoose");
var passport = require("passport");
var flash = require("connect-flash");

var csrf = require("csurf");
var csrfProtection = csrf({ cookie: true });
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");

const userRouter = require("./app/routes/userRoutes");
const viewRouter = require("./app/routes/viewRoutes");
const insectRouter = require("./app/routes/insectRoutes");
const collectionRouter = require("./app/routes/collectionRoutes");
const observationRouter = require("./app/routes/observationRoutes");
const dbRouter = require("./app/routes/dbRoutes");

var configDB = require("./app/config/dbConfig.js");

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require("./app/config/passport")(passport); // pass passport for configuration

// set up our express application
app.use(cookieParser()); // read cookies (needed for auth)

//++++
//app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "app/public")));
app.use(express.static(path.join(__dirname, "app/bower_components")));
//+++++

// view engine setup
//+++
app.set("views", path.join(__dirname, "app/views"));
//++++
app.set("view engine", "jade"); // set up jade/pug for templating

// +++++
app.set("json spaces", 40);
// +++++

// required for passport
app.use(
  session({
    secret: "ilovescotchscotchyscotchscotch",
    cookie: { secure: false },
    resave: false,
    saveUninitialized: false,
  })
); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
// Initialize Passport
var initPassport = require("./passport/init");
initPassport(passport);

app.use(csrfProtection);
app.use(function (req, res, next) {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

// routes
userRouter(app, passport);
app.use("/", viewRouter);
app.use("/insects", insectRouter);
app.use("/collections", collectionRouter);
app.use("/observations", observationRouter);
app.use("/db", dbRouter);

// catch 404 and forward to error handler
app.all("*", function (req, res, next) {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    console.log("in dev error handler, err", err);
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}

if (app.get("env") === "production") {
  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    console.log("in gen error handler");

    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: {},
    });
  });
}

module.exports = app;
app.listen(port, function () {
  console.log("Working on port " + port);
});
