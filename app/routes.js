// load up the user model
var User = require("./models/user");
var Insect = require("./models/insect");
var Compendium = require("./models/compendium");

var Observation = require("./models/observation");
var fs = require("fs");

var multer = require("multer");
//var gm = require("gm");
var sharp = require("sharp");
var path = require("path");

// app/routes.js
module.exports = function (app, passport) {
  app.get("/populate_db", function (req, res) {});

  // return all the items in the user's collection
  app.get("/collection/list", function (req, res) {});

  app.delete("/collection/removemany", function (req, res) {});

  app.delete("/collection/remove", function (req, res) {});

  /* Load user's uploaded insects */
  app.get("/uploadList", function (req, res) {});

  /* Upload or modify insect */
  app.post("/insect/insert", function (req, res) {});

  app.post("/observation/add", function (req, res) {});

  app.get("/observation/list", function (req, res) {});

  app.delete("/insect/delete", function (req, res) {});

  app.get("/observation/browse", async function (req, res) {});

  app.post("/collection/insertmany", function (req, res) {});

  app.post("/collection/insert", function (req, res) {});

  app.get("/collection/searchItem", function (req, res) {
    console.log("searching item in collection");
    console.log("req.user: " + req.user);
    if (!req.isAuthenticated()) {
      return res.send(null);
    } else {
      User.findOne(
        { "local.email": req.user.local.email },
        function (err, user) {
          console.log("found user's email");
          if (err) {
            console.log(err);
          }

          // find the user's collection
          console.log("user: " + req.user.id);

          console.log("insectId: " + req.query.insectId);
          var found = false;
          Compendium.findOne(
            { _user: req.user.id },
            function (err, compendium) {
              if (compendium) {
                console.log(
                  "found a user's compendium with size " +
                    compendium.insects.length
                );
                var insectId = JSON.stringify(req.query.insectId);

                for (var i = 0; i < compendium.insects.length; i++) {
                  console.log(
                    "compendium.insects[i]: " +
                      JSON.stringify(compendium.insects[i]) +
                      " with insectId: " +
                      insectId
                  );

                  if (JSON.stringify(compendium.insects[i]) == insectId) {
                    console.log("found insect from compendium");
                    return res.send("success");
                  }
                }
                if (!found) return res.send(null);
              } else {
                return res.send(null);
              }
            }
          );
        }
      );
    }
  });
};
