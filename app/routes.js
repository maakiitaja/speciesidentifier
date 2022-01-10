// load up the user model
var User = require("./models/user");
var Compendium = require("./models/compendium");
var Insect = require("./models/insect");
var Observation = require("./models/observation");
var ObservationDetail = require("./models/observationDetail");
var fs = require("fs");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var multer = require("multer");
var im = require("imagemagick");
var gm = require("gm");
var path = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log("destination: " + __dirname + "/public/images/");
    callback(null, __dirname + "/public/images/");
  },

  filename: function (req, file, callback) {
    console.log("renaming file.");
    console.log("file name: " + file.originalname);
    callback(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

function fileFilter(req, file, cb) {
  /*
  // The function should call `cb` with a boolean
  // to indicate if the file should be accepted

  // To reject this file pass `false`, like so:
  cb(null, 0);

  // To accept the file pass `true`, like so:
  cb(null, 1);

  // You can always pass an error if something goes wrong:
  cb(new Error('I don\'t have a clue!'))
*/
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) return next();

  // if they aren't redirect them to the home page
  res.redirect("/");
}

// img path
var imgPath =
  __dirname +
  "/public/images/Carabus nemoralis lehtokiitäjäinen tv20130514_009.jpg";

// example schema
var schema = new Schema({
  img: { data: Buffer, contentType: String },
});

// our model
var A = mongoose.model("A", schema);

// app/routes.js
module.exports = function (app, passport) {
  app.get("/image-test", function (req, res) {
    // empty the collection
    A.remove(function (err) {
      if (err) throw err;

      console.error("removed old docs");

      // store an img in binary in mongo
      var a = new A();
      a.img.data = fs.readFileSync(imgPath);
      a.img.contentType = "image/png";
      a.save(function (err, a) {
        if (err) throw err;

        console.error("saved img to mongo");
        A.findById(a, function (err, doc) {
          if (err) return next(err);
          res.contentType(doc.img.contentType);
          res.send(doc.img.data);
        });
      });
    });
  });

  app.get("/populate_db", function (req, res) {
    console.log("populate_db");

    console.log("reading insects json");
    var dburl;
    var insects;
    fs.readFile(
      __dirname + "/public/insects/insects.json",
      "utf8",
      function (err, data) {
        var insects = JSON.parse(data);
        var i = 0;
        console.log("insects.length: " + insects.length);
        var insectLength = insects.length;
        for (var i = 0; i < insectLength; i++) {
          console.log(insects[i]);
          for (var name in insects[i]) {
            //console.log("Item name: " + name);
            //console.log("Prop: " + insects[i][name]);
          }
        }

        // empty the collection
        Insect.remove(function (err) {
          if (err) throw err;
          for (var i = 0; i < insects.length; i++) {
            var insect = insects[i];

            var newInsect = new Insect();

            newInsect.translations = [];
            console.log("writing translations");
            for (var j = 0; j < insect["names"].length; j++) {
              newInsect.translations.push({
                language: insect["names"][j].language,
                name: insect["names"][j].name,
              });
            }
            console.log("newinsect translations: " + newInsect.translations);
            newInsect.userId = "1"; // default
            newInsect.latinName = insect["LatinName"];
            newInsect.legs = insect["Legs"];
            newInsect.territory = insect["Territory"];
            newInsect.primaryColor = insect["PrimaryColor"];
            newInsect.secondaryColor = insect["SecondaryColor"];
            newInsect.wiki = insect["Wiki"];
            newInsect.images = [];
            var imagesTmp = insect["Images"].split(",");

            for (var ind in imagesTmp) {
              //console.log("image name: " + imagesTmp[ind]);
              if (path.sep === "\\") {
                console.log("path seperator is \\");
                //var index = imagesTmp[ind].indexOf('/');
                //console.log('index: '+index);
                var str = imagesTmp[ind];
                //console.log('str[index]'+str[index]);
                //str[index] = "\\";
                str = str.split("/").join("\\");
                //console.log("str: " + str);
                imagesTmp[ind] = str;
                //console.log("image: " + imagesTmp[ind]);
              }
              newInsect.images.push(imagesTmp[ind]);
            }
            console.log("newInsect.images: " + newInsect.images);

            newInsect.category = insect["Category"];

            //thumb picture
            // for (var ind in imagesTmp) {
            //   console.log("ind: " + ind);
            //   console.log("image name: " + newInsect.images[ind]);
            //   //console.log("dirname: " + __dirname);
            //   var srcPath =
            //     __dirname +
            //     path.sep +
            //     "public" +
            //     path.sep +
            //     newInsect.images[ind];
            //   console.log("srcpath: " + srcPath);
            //   gm(srcPath)
            //     .resize(150, 150)
            //     .write(srcPath + "_thumb.jpg", function (err) {
            //       if (err) console.log(err);
            //       else
            //         console.log(
            //           "resized file: " +
            //             __dirname +
            //             "/public/" +
            //             insect["Images"][ind]
            //         );
            //     });
            /*im.resize(
              {
                srcPath:
                  srcPath,
                dstPath:
                  srcPath +
                  '_thumb.jpg',
                width: 150,
                height: 150
              },
              function(err, stdout, stderr) {
                if (err) throw err;
                console.log(
                  "resized file: " + __dirname + "/public/" + insect["Images"]
                );
              }
            );*/
            //}

            //console.log("newInsect: " + newInsect);
            newInsect.save(function (err) {
              if (err) throw err;
              console.log("Insect saved");
              console.log(JSON.parse(JSON.stringify(newInsect)));
            });
          }
        });

        res.redirect("/#/main");
      }
    );
  });

  app.get("/insect/search", function (req, res) {
    var primaryColor = req.query.primaryColor;
    var secondaryColor = req.query.secondaryColor;
    var category = req.query.category;
    var legs = req.query.legs;
    var latinName = req.query.latinName;
    console.log(
      "primaryColor: " +
        req.query.primaryColor +
        " ,secondaryColor: " +
        req.query.secondaryColor +
        ", legs:" +
        req.query.legs
    );
    console.log("latinName: " + req.query.latinName);
    var query = Insect.find();
    if (req.query.category) {
      query.where("category").equals(category);
    }
    if (req.query.primaryColor) {
      query.where("primaryColor").equals(primaryColor);
    }
    if (req.query.secondaryColor) {
      query.where("secondaryColor").equals(secondaryColor);
    }
    if (req.query.legs) {
      query.where("legs").equals(legs);
    }
    if (req.query.latinName) {
      query.where("latinName").equals(latinName);
    }

    console.log("searching");

    query.exec(function (err, insects) {
      if (err) throw err;
      console.log(insects);
      console.log(JSON.stringify(insects));
      res.send(insects);
    });
  });

  app.get("/insect/list", function (req, res) {
    Insect.find({}, function (err, insects) {
      if (err) {
        console.log(err);
      }

      console.log("found insects: " + insects);
      res.send(insects);
    });
  });

  app.get("/collection/list", function (req, res) {
    if (req.isAuthenticated()) {
      Compendium.findOne({ _user: req.user.id }, function (err, compendium) {
        if (err) {
          console.log(err);
        }
        if (compendium == null) {
          res.send(null);
        } else {
          console.log("found compendium: " + compendium);
          console.log(
            "insects in compendium: " + JSON.stringify(compendium.insects)
          );
          // find the insects
          var ids = compendium.insects;
          console.log("ids: " + ids);

          Insect.find()
            .where("_id")
            .in(ids)
            .sort("category")
            .exec(function (err, results) {
              if (err) throw err;
              console.log("results: " + results);
              res.send(results);
            });
        }
      });
    }
  });

  app.get("/collection/remove", function (req, res) {
    if (req.isAuthenticated()) {
      console.log("searching user's compendium");
      Compendium.findOne({ _user: req.user.id }, function (err, compendium) {
        console.log("compendium: " + compendium);
        if (compendium == null) {
          console.log("send fail");
          return res.send("fail");
        }
        console.log("found insects in compendium: " + compendium.insects);
        var success = false;
        var insectId = JSON.stringify(req.query._id);
        for (var i = 0; i < compendium.insects.length; i++) {
          if (JSON.stringify(compendium.insects[i]) == insectId) {
            console.log(
              "compendium.insects.length: " + compendium.insects.length
            );
            compendium.insects.splice(i, 1);
            console.log(
              "compendium.insects.length: " + compendium.insects.length
            );
            success = true;
            break;
          }
        }
        if (success) {
          compendium.save(function (err) {
            console.log("compendium:" + compendium);
            console.log("saved compendium. ");
            res.send("success");
          });
        } else {
          console.log("failed to locate insect in compendium");
          res.send(null);
        }
      });
    } else res.send(null);
  });

  /* Upload insect */
  app.post(
    "/insect/populate",
    upload.array("userPhotos", 100),
    function (req, res) {
      // thumb picture
      for (var i = 0; i < req.files.length; i++) {
        var file = req.files[i];
        console.log("destination: " + file.destination + file.filename);
        im.resize(
          {
            srcPath: file.destination + file.filename,
            dstPath: file.destination + file.filename + "_thumb.jpg",
            width: 100,
            height: 100,
          },
          function (err, stdout, stderr) {
            if (err) throw err;
            console.log("resized file: " + file.filename);
          }
        );
      }
      res.redirect("#/main");
    }
  );

  /* Load user's uploaded insects */
  app.get("/uploadList", function (req, res) {
    console.log("userId: " + req.query.userId);
    Insect.find({ userId: req.query.userId }).exec(function (err, insects) {
      if (err) {
        console.log(err);
      }

      console.log("found insects: " + insects);
      res.send(insects);
    });
  });

  /* Load an insect */
  app.get("/insect/load", function (req, res) {
    Insect.find({ userId: req.query.userId }).exec(function (err, results) {
      if (err) throw err;
      console.log("results: " + results);
      insect = results;
      res.send(results);
    });
  });

  /* Upload or modify insect */
  app.post(
    "/insect/insert",
    upload.array("userPhotos", 10),
    function (req, res) {
      console.log("uploading or modifying insect");
      console.log("isupload: " + req.body.isUpload);
      console.log("insectId: " + req.body.insectId);
      console.log("userId:" + req.user.id);

      var isUpload = req.body.isUpload;
      var handleUpload = function (req, res, insect) {
        if (req.files.length > 1) {
          console.log("image2: " + req.files[1]);
        }

        console.log("wiki: " + req.body.wiki);
        insect.latinName = req.body.latinName;
        insect.legs = req.body.legs;
        insect.primaryColor = req.body.primaryColor;
        insect.secondaryColor = req.body.secondaryColor;
        insect.wiki = req.body.wiki;
        insect.category = req.body.category;
        insect.userId = req.user.id;
        console.log("insect.translations: " + insect.translations);

        if (isUpload) {
          console.log("adding new translations");
          console.log(insect);
          insect.translations = [];
          insect.translations.push({ language: "en", name: req.body.enName });
          insect.translations.push({ language: "fi", name: req.body.fiName });
        } else {
          console.log("updating names.");
          console.log("insect.translations[0]: " + insect.translations[0]);
          console.log(
            "insect.translations[0].name: " + insect.translations[0].name
          );
          insect.translations[0].name = req.body.enName;
          insect.translations[1].name = req.body.fiName;
        }
        console.log("insect.translations: " + insect.translations);
        console.log("insect.translations[0]: " + insect.translations[0]);
        console.log(
          "insect.translations[0].name: " + insect.translations[0].name
        );

        console.log("read body variables.");

        if (req.body.imageLinks) {
          console.log("imagelinks: " + req.body.imageLinks);
          var imageUrls = req.body.imageLinks.split(",");

          for (var ind in imageUrls) insect.images.push(imageUrls[ind]);
        }
        console.log("creating thumb picture");
        // thumb picture
        for (var i = 0; i < req.files.length; i++) {
          var file = req.files[i];
          console.log("destination: " + file.destination + file.filename);
          gm(file.destination + file.filename)
            .resize(150, 150)
            .write(
              file.destination + file.filename + "_thumb.jpg",
              function (err) {
                if (err) console.log(err);
                else
                  console.log(
                    "resized file: " + file.destination + file.filename
                  );
              }
            );
          /*im.resize(
          {
            srcPath: file.destination + file.filename,
            dstPath: file.destination + file.filename + "_thumb.jpg",
            width: 150,
            height: 150
          },
          function(err, stdout, stderr) {
            if (err) throw err;
            console.log("resized file: " + file.filename);
          }
        );*/
        }

        if (isUpload == "1") {
          console.log("saving insect");
          insect.save(function (err) {
            if (err) throw err;
            console.log("Insect saved");
            console.log("insect: " + insect);
            res.redirect("/#/main");
          });
        } else {
          console.log("updating insect");
          var update = {
            wiki: insect.wiki,
            category: insect.category,
            primaryColor: insect.primaryColor,
            secondaryColor: insect.secondaryColor,
            legs: insect.legs,
            images: insect.images,
            latinName: insect.latinName,
            imageLinks: insect.imageLinks,
            translations: insect.translations,
          };
          var conditions = { _id: insect._id };
          var options = { multi: true };
          var callback = function callback(err, numAffected) {
            // numAffected is the number of updated documents
            if (err) throw err;
            console.log("insect updated");
            res.redirect("/#/main");
          };

          Insect.update(conditions, update, options, callback);
        }
      };

      if (isUpload == "0") {
        console.log("modifying insect");
        /* Modify */
        Insect.find({ _id: req.body.insectId }).exec(function (err, results) {
          if (err) throw err;
          var insect = results[0];

          console.log(insect);

          console.log("removing selected images");
          /* Remove selected images */

          console.log("insect.images:" + insect.images);
          var removedPhotoInd = 0;
          console.log("images.length: " + insect.images.length);
          var imagesLength = insect.images.length;
          for (var i = 0; i < imagesLength; i++) {
            var ind = i - removedPhotoInd;
            var photo = insect.images[ind];
            console.log("photo: " + photo);
            console.log("photo in body: " + req.body[photo]);

            if (req.body[photo]) {
              console.log("removing photo: " + photo);

              insect.images.splice(ind, 1);
              removedPhotoInd++;
              console.log("insect's images: " + insect.images);
            }
          }

          console.log("adding new images ");
          // add possible new images
          for (var i = 0; i < req.files.length; i++) {
            console.log("req.files: " + req.files[i].originalname);
            /* check duplicates */
            var isDuplicate = false;
            for (var j = 0; j < insect.images.length; j++) {
              if (insect.images[j] == req.files[i].originalname)
                isDuplicate = true;
            }
            if (!isDuplicate)
              insect.images.push("images/" + req.files[i].originalname);
            else console.log("found duplicate: " + req.files[i].originalname);
          }
          handleUpload(req, res, insect);
        });
      } else {
        console.log("uploading insect");
        var insect = new Insect();
        insect.images = [];
        for (var ind in req.files) {
          console.log("file ind: " + ind);
          console.log(
            "req.files[ind].originalname" + req.files[ind].originalname
          );
          insect.images.push("images/" + req.files[ind].originalname);
        }
        handleUpload(req, res, insect);
      }
    }
  );

  app.get("/observationplace/list", function (req, res) {
    console.log("observation list");
    console.log("req.user.id: " + req.user.id);
    /*
	var observationPlaceId = '5991ed69ab49543a531456fa';
	var query = Observation.find();
	query.where('_id').equals(observationPlaceId)
	query.exec(function (err, observation) {
		console.log('observation: '+observation);
		res.send(observation);
	});*/

    Observation.find({ user: req.user.id }, function (err, observations) {
      if (err) throw err;
      console.log("finished searching user's observation places");

      if (observations.length > 1) {
        console.log("observations[0].country: " + observations[0].country);
      }
      res.send(observations);
    });
  });

  app.post("/observation/add", function (req, res) {
    console.log("observation add");

    var saveObservation = function (observationDetail, observation, res) {
      if (observation == null) {
        console.log(
          "searching existing observation place with id: " +
            req.query.observationPlaceId
        );
        Observation.find()
          .where("_id")
          .equals(req.query.observationPlaceId)
          .exec(function (err, observation) {
            if (err) throw err;
            console.log("found existing observation place");
            console.log("observation: " + observation);
            if (observation.length == 1) {
              observation = observation[0];
              console.log("observation lenght is 1");
            }
            console.log("observation.country: " + observation.country);
            saveObservationDetail(observationDetail, observation, res);
          });
      } else saveObservationDetail(observationDetail, observation, res);
    };

    var saveObservationDetail = function (observationDetail, observation, res) {
      console.log("saving observation detail: " + observationDetail);

      observationDetail.save(function (err, item) {
        if (err) throw err;
        console.log("saved observation detail");
        observation.detail.push(item.id);
        console.log("observation.country: " + observation.country);
        console.log("saving observation: " + observation);
        observation.save(function (err) {
          console.log("observation saved");
          res.send("success");
        });
      });
    };
    console.log("starting to add observation");
    // observationplace specific
    var observation = null;
    if (req.query.observationPlaceId == null) {
      console.log("observationplaceid == null");
      var observation = new Observation();

      observation.user = req.user.id;
      console.log("observation country: " + req.query.country);
      observation.country = req.query.country;
      observation.place = req.query.place;
      observation.location = req.query.location;
      console.log("checking farm type");
      console.log("organicfarm: " + req.query.organicFarm);
      console.log("nonorganicfarm: " + req.query.nonOrganicFarm);

      if (
        req.query.organicFarm == "true" ||
        req.query.nonOrganicFarm == "true"
      ) {
        console.log("observation place is a farm");

        if (req.query.organicFarm == "true") {
          console.log("observation place is an organic farm");
          observation.organicFarm = true;
        } else {
          console.log("observation place is an nonorganic farm");
          observation.organicFarm = false;
        }
      } else {
        observation.organicFarm = undefined;
      }
    }

    if (!req.isAuthenticated()) req.send(null);
    else {
      var observationDetail = new ObservationDetail();

      // observationdetail
      console.log("observation detail date");
      observationDetail.date = new Date(req.query.date);
      observationDetail.count = req.query.count;
      console.log("checking insect id");
      console.log("insectId: " + req.query.insectId);
      if (req.query.insectId != null && req.query.insectId != "") {
        console.log("insectId was sent");
        observationDetail.insect = req.query.insectId;
        saveObservation(observationDetail, observation, res);
      } else {
        console.log("searching insect by latin name");
        console.log("req.query.latinName: " + req.query.latinName);
        if (req.query.latinName != null && req.query.latinName != "") {
          Insect.findOne({ latinName: req.query.latinName }).exec(function (
            err,
            insect
          ) {
            if (err) throw err;

            console.log("found insect by latin name: " + insect);
            if (insect != null) observationDetail.insect = insect._id;
            saveObservation(observationDetail, observation, res);
          });
        } else res.send(null);
      }
    }
  });

  app.get("/observation/browse", function (req, res) {
    console.log("observation browse");

    var performQuery = function (query, observations, req, res, insectId) {
      if (insectId) {
        console.log("search narrowed by insectid");
        query.where("insect").equals(insectId);
      }

      // time specific search
      var startDate;
      var endDate;

      if (req.query.startDate != "") startDate = new Date(req.query.startDate);
      if (req.query.endDate != "") endDate = new Date(req.query.endDate);

      console.log("startDate: " + startDate + " and enddate: " + endDate);

      if (startDate && endDate) {
        if (
          startDate.getFullYear() == endDate.getFullYear() &&
          startDate.getMonth() == endDate.getMonth() &&
          startDate.getDate() == endDate.getDate()
        ) {
          console.log("startdate equals enddate.");
          startDate.setDate(startDate.getDate() - 1);
          //startDate.setHours(0, 0, 0, 0);
          //endDate.setHours(23, 59,59,999);
          //query.where('date').equals(startDate);
        }

        console.log(
          "querying within a time range of: " + startDate + " - " + endDate
        );
        query.where({ date: { $gte: startDate, $lte: endDate } });
      } else if (startDate) query.where({ date: { $gte: startDate } });
      else if (endDate) query.where({ date: { $lte: endDate } });

      //query.sort('insectId');
      query.sort("date");

      console.log("starting to search observations");
      query.exec(function (err, observationDetails) {
        if (err) throw err;
        console.log("search finished");
        console.log("observation details: " + observationDetails);
        // add the name of the insect to the observation detail

        // make a list of referred insects
        var finalInsectIds = [];
        for (var i = 0; i < observationDetails.length; i++) {
          if (
            observationDetails[i].insect == "" ||
            observationDetails[i].insect == null
          )
            console.log("observation detail insect is empty");
          else finalInsectIds.push(observationDetails[i].insect);
        }
        console.log("finalInsectids: " + finalInsectIds);

        Insect.find()
          .where("_id")
          .in(finalInsectIds)
          .exec(function (err, insects) {
            console.log(
              "found insects for the observation details: " + insects
            );
            console.log(
              "adding the name of the insect to the observation detail"
            );

            var joinedResults = [];

            if (req.query.category)
              console.log(
                "search is narrowed by category:" + req.query.category
              );

            for (var i = 0; i < observationDetails.length; i++) {
              for (var j = 0; j < insects.length; j++) {
                if (req.query.category != "") {
                  console.log("insects[j].category: " + insects[j].category);
                  if (insects[j].category == req.query.category) {
                    var insectIdStr = JSON.stringify(
                      observationDetails[i].insect
                    );
                    console.log("insects[" + j + "]._id:" + insects[j]._id);
                    console.log(
                      "observationDetails[" + i + "].insect:" + insectIdStr
                    );

                    if (JSON.stringify(insects[j]._id) == insectIdStr) {
                      console.log("joining result with category filtered");
                      joinedResults.push({
                        _id: observationDetails[i]._id,
                        insect: observationDetails[i].insect,
                        latinName: insects[j].latinName,
                        count: observationDetails[i].count,
                        date: observationDetails[i].date,
                      });
                    }
                  }
                } else {
                  if (
                    JSON.stringify(insects[j]._id) ==
                    JSON.stringify(observationDetails[i].insect)
                  ) {
                    console.log("adding an joined result item");
                    joinedResults.push({
                      _id: observationDetails[i]._id,
                      insect: observationDetails[i].insect,
                      latinName: insects[j].latinName,
                      count: observationDetails[i].count,
                      date: observationDetails[i].date,
                    });
                  }
                }
              }
            }

            console.log("joinedresults length: " + joinedResults.length);

            // join observation information to the observation detail result set
            for (var i = 0; i < observations.length; i++) {
              console.log("joining observation table");
              for (var j = 0; j < joinedResults.length; j++) {
                console.log("joinedResults id: " + joinedResults[j]._id);
                for (var k = 0; k < observations[i].detail.length; k++) {
                  console.log(
                    "observations detail id: " + observations[i].detail[k]
                  );

                  if (
                    JSON.stringify(observations[i].detail[k]) ==
                    JSON.stringify(joinedResults[j]._id)
                  ) {
                    console.log(
                      "joining observation detail params with result set"
                    );
                    joinedResults[j].location = observations[i].location;
                    joinedResults[j].place = observations[i].place;
                    joinedResults[j].country = observations[i].country;
                    //joinedResults[j].location = observations[i].location;
                    joinedResults[j].place = observations[i].place;
                    joinedResults[j].farm = observations[i].farm;
                    joinedResults[j].organicFarm = observations[i].organicFarm;
                  }
                }
              }
            }

            console.log("joinedResults: " + joinedResults);

            res.send(joinedResults);
          });
      });
    };

    // params: date, country, location, place, organicfarm
    var insectId = req.query.insectId;
    console.log("checking for dates");
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    console.log("startdate: " + startDate + ", enddate: " + endDate);
    console.log("checking for place");
    var country = req.query.country;
    var location = req.query.location;

    var place = req.query.place;
    var nofarm = req.query.nofarm;
    var organicFarm = req.query.organicFarm;
    var nonOrganicFarm = req.query.nonOrganicFarm;
    console.log(
      "organicfarm: " + organicFarm + ", nonorganicfarm: " + nonOrganicFarm
    );
    console.log("checking for insect");
    var name = req.query.name;
    var language = req.query.language;
    var latin = "Latin";

    var query = Observation.find();

    console.log("narrowing observation place search");

    console.log("organicFarm == 'false'");
    console.log(organicFarm == "false");
    console.log("organicFarm == 'true'");
    console.log(organicFarm == "true");

    if (country) {
      console.log("by country: " + country);

      query.where("country").equals(country);
    }

    if (location) {
      console.log("by location: " + location);
      query.where("location").equals(location);
    }

    if (place) {
      console.log("by place: " + place);
      query.where("place").equals(place);
    }
    console.log("nofarm: " + nofarm);

    console.log("by farmtype");
    farm = true;
    if (req.query.byType == "true") {
      console.log("search is type specific");

      if (organicFarm == "true") {
        console.log("organicfarm");
        query.where("organicFarm").equals(true);
      } else if (nonOrganicFarm == "true") {
        console.log("nonorganicfarm");
        query.where("organicFarm").equals(false);
      } else if (req.query.nofarm == "true") {
        console.log("nofarm");

        query.where("organicFarm").equals(undefined);
      }
    }

    console.log("checking location");
    // search has been narrowed by location
    if (country || location || place) {
      console.log("Searching for observations...");
      query.exec(function (err, observations) {
        if (err) throw err;
        console.log("finished searching observations.");
        console.log(observations);
        var observationDetailIds = [];
        // collect referred observationdetails
        for (var i = 0; i < observations.length; i++) {
          for (var j = 0; j < observations[i].detail.length; j++)
            observationDetailIds.push(observations[i].detail[j]);
        }

        var detailQuery;
        if (observations.length > 0) {
          console.log("query is narrowed by observation places");
          detailQuery = ObservationDetail.find()
            .where("_id")
            .in(observationDetailIds);
          console.log("req.query.name: " + name);
          var query = Insect.find();
          if (name != "" && name != "undefined" && name != undefined) {
            console.log("query is narrowed by insect name");
            if (language == latin) {
              console.log("searching by latinname: " + name);
              query.where("latinName").equals(name);
            } else {
              console.log("searching by translation name");
              query.where("translations.name").equals(name);
            }
            query.exec(function (err, insects) {
              if (err) throw err;
              console.log("results: " + insects);
              if (insects)
                performQuery(
                  detailQuery,
                  observations,
                  req,
                  res,
                  insects[0]._id
                );
              else res.send(null);
            });
          } else {
            console.log("searching by date and place");
            performQuery(detailQuery, observations, req, res, null);
          }
        } else {
          console.log("no place specific search criteria was sent");
          performQuery(
            ObservationDetail.find({}),
            observations,
            req,
            res,
            null
          );
        }
      });
    }
  });

  app.get("/collection/insert", function (req, res) {
    console.log("searching user by email");
    console.log("user: " + req.user);
    console.log("user's email: " + req.user.email);
    User.findOne({ email: req.user.email }, function (err, user) {
      console.log("found user's email");
      if (err) {
        console.log(err);
      }
      // find the user's collection
      console.log("user: " + req.user.id);

      console.log("insectId: " + req.query.insectId);
      Compendium.findOne({ _user: req.user.id }, function (err, compendium) {
        console.log("found a user's compendium");
        if (compendium) {
          console.log("updating a collection");
          compendium.insects.push(req.query.insectId);
          console.log("updated compendium: " + compendium);
          compendium.save(function (err) {
            if (err) throw err;
            console.log("updated compendium item");
          });
        } else {
          // create a new collection
          console.log("creating a new collection");
          var newCompendium = new Compendium();
          newCompendium._user = req.user.id;
          console.log("newCompendium.insects: " + newCompendium.insects);
          newCompendium.insects.push(req.query.insectId);
          //newCompendium.insects.push(req.params.insectId);
          //newCompendium._user=req.user.id;
          console.log("newCompendium: " + newCompendium);
          newCompendium.save(function (err) {
            if (err) throw err;
            console.log("saved compendium item");
          });
        }
        res.send(req.user);
        /*
		  Compendium.find({}, function(err, compendiums) {
			if (err) throw err;
				console.log('compendiums: '+compendiums);
				res.send(compendiums);
			});*/
      });
      console.log("after searching a user's collection");
    });
  });

  app.get("/currentUser", function (req, res) {
    if (req.isAuthenticated()) {
      var _user = {};
      _user = req.user;
      console.log("current user: " + req.user);
      res.send(_user);
    } else res.send(null);
  });

  app.get("/collection/searchItem", function (req, res) {
    console.log("searching item in collection");
    console.log("req.user: " + req.user);
    if (!req.isAuthenticated()) {
      res.send(null);
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
                    res.send("success");
                    found = true;
                    break;
                  }
                }
                if (!found) res.send(null);
              } else {
                res.send(null);
              }
            }
          );
        }
      );
    }
  });

  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  app.get("/", function (req, res) {
    res.sendFile("index.html");
  });
  // a full list of insects
  app.get("/user/list", function (req, res) {
    // get all the insects

    var email = "mauri.f@suomi.fi";
    console.log("before database record is created");

    var insectCollection = new Insect();
    console.log("after database record creation");

    Insect.find({}, function (err, insects) {
      if (err) {
        console.log(err);
      }

      console.log("found insects: " + insects);
    });
    User.findOne({ "local.email": email }, function (err, user) {
      //user.find({}, function(err, insects) {
      if (err) {
        console.log(err);
      }
      // object of all the users
      console.log("found user: " + user);
      res.send(user);
    }); //
  }); //

  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form
  /*
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('error') }); 
    });*/

  // process the login form
  app.post(
    "/login",
    passport.authenticate("login", {
      successRedirect: "/#/main", // redirect to the secure profile section
      failureRedirect: "/#/login-failure", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  ); // // // process the signup form

  // process the login form
  // app.post('/login', do all our passport stuff here);

  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  /*
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('error') });
    });*/ app.post(
    "/signup",
    passport.authenticate("signup", {
      successRedirect: "/#/main", // redirect to the secure profile section
      failureRedirect: "/#/signup-failure", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );

  // process the signup form
  // app.post('/signup', do all our passport stuff here);

  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get("/profile", isLoggedIn, function (req, res) {
    res.render("profile.ejs", {
      user: req.user, // get the user out of session and pass to template
    }); //
  }); //

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/#/login");
  });
};
