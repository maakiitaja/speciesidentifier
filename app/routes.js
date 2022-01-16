// load up the user model
var User = require("./models/user");
var Insect = require("./models/insect");
var Compendium = require("./models/compendium");

var Observation = require("./models/observation");
var ObservationDetail = require("./models/observationDetail");
var fs = require("fs");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var multer = require("multer");
var im = require("imagemagick");
var gm = require("gm");
var path = require("path");
const observation = require("./models/observation");

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log("destination: " + __dirname + "/public/images/");
    callback(null, __dirname + "/public/images/");
  },

  filename: function (req, file, callback) {
    console.log("renaming file.");
    console.log("file name: " + file.originalname);
    const now = new Date();
    console.log("current time: ", now.getTime());
    const renamedFilename = file.originalname + now.getTime();

    callback(null, renamedFilename);
  },
});
var upload = multer({
  limits: {
    fieldNameSize: 500,
    fileSize: 1048576, //  1048576
  },
  storage: storage,
}).fields([
  {
    name: "userPhotos",
    maxCount: 5,
  },
  { name: "userPhotos2", maxCount: 5 },
]);

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
    var name = req.query.name;
    var language = req.query.language;

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
    if (req.query.name && req.query.language === "Latin") {
      console.log("search by latin name");
      query.where("latinName").equals(req.query.name);
    }

    if (
      req.query.name &&
      req.query.language &&
      req.query.language !== "Latin"
    ) {
      console.log("search by specific language and name");
      query.where("translations.language").equals(req.query.language);
      query.where("translations.name").equals(req.query.name);
    }

    if (!req.query.language && req.query.name) {
      console.log("search by name and all languages");
      query.where("translations.name").equals(req.query.name);
    }

    console.log("name:", name, "language:", language);

    query.exec(function (err, insects) {
      if (err) throw err;
      console.log(insects[0]);

      return res.send(insects);
    });
  });

  app.get("/collection/list", function (req, res) {
    if (!req.isAuthenticated()) {
      console.log("not authenticated");
      return res.send(null);
    }

    Compendium.findOne({ _user: req.user.id }, function (err, compendium) {
      if (err) {
        console.log(err);
      }
      if (compendium == null) {
        return res.send(null);
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
            return res.send(results);
          });
      }
    });
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
            return res.send("success");
          });
        } else {
          console.log("failed to locate insect in compendium");
          return res.send(null);
        }
      });
    } else return res.send(null);
  });

  /* Load user's uploaded insects */
  app.get("/uploadList", function (req, res) {
    console.log("userId: " + req.query.userId);
    Insect.find({ userId: req.query.userId }).exec(function (err, insects) {
      if (err) {
        console.log(err);
      }

      console.log("found insects: " + insects);
      return res.send(insects);
    });
  });

  /* Load an insect */
  app.get("/insect/load", function (req, res) {
    Insect.find({ userId: req.query.userId }).exec(function (err, results) {
      if (err) throw err;
      console.log("results: " + results);
      insect = results;
      return res.send(results);
    });
  });

  /* Upload or modify insect */
  app.post("/insect/insert", function (req, res) {
    upload(req, res, function (err) {
      if (err) {
        console.log("got upload error, file limit exceeded?, err: ", err);
        // would need to redirect to error view
        return res.redirect("/#/fileuploaderror");
      }

      if (!req.isAuthenticated()) {
        return res.send(null);
      }
      console.log("uploading or modifying insect");
      console.log("isupload: " + req.body.isUpload);
      console.log("insectId: " + req.body.insectId);
      console.log("userId:" + req.user.id);

      var isUpload = req.body.isUpload;
      var handleUpload = async function (req, res, insect) {
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

        console.log("creating thumb picture");
        // thumb picture
        for (var filesInput in req.files) {
          var files = req.files[filesInput];
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
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

          await Insect.updateOne(conditions, update);
          console.log("insect updated");
          try {
            return res.redirect("/#/main");
          } catch (err) {
            console.log("error in redirect");
            return res.send(null);
          }
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
              // TODO remove the photo file from the server
            }
          }

          console.log("req.files: ", req.files);
          // add possible new images
          for (var filesInput in req.files) {
            console.log("req.files[filesName]:", req.files[filesInput]);
            console.log(
              "req.files[filesName].length",
              req.files[filesInput].length
            );
            var files = req.files[filesInput];

            for (var i = 0; i < files.length; i++) {
              console.log(
                "req.files[filesName][i].fileName: ",
                files[i].filename
              );
              /* check duplicates */
              var isDuplicate = false;
              for (var j = 0; j < insect.images.length; j++) {
                if (insect.images[j] == files.filename) isDuplicate = true;
              }
              if (!isDuplicate) {
                console.log("adding a new file to insect,", files[i].filename);
                console.log("files[i]: " + files[i]);
                insect.images.push("images/" + files[i].filename);
              } else console.log("found duplicate: " + files[i].filename);
            }
          }

          handleUpload(req, res, insect);
        });
      } else {
        console.log("uploading new insect");
        var insect = new Insect();
        insect.images = [];
        console.log("iterating over fileinputs: ", req.files);

        // add file names
        for (var filesInput in req.files) {
          var files = req.files[filesInput];
          console.log("files are: ", files, " with length: " + files.length);

          for (var i = 0; i < files.length; i++) {
            console.log("req.files[ind].filename" + files[i].filename);
            insect.images.push("images/" + files[i].filename);
          }
        }
        handleUpload(req, res, insect);
      }
    });
  });

  app.post("/latinNameExists", function (req, res) {
    console.log("latinNameExist function req.body: ", req.body);
    Insect.findOne({ latinName: req.body.latinName }).exec(function (
      err,
      insect
    ) {
      if (err) throw err;
      if (insect) {
        console.log("found latinname");
        return res.send({ msg: true });
      } else {
        console.log('didn"t find latinname');
        return res.send(null);
      }
    });
  });

  app.post("/observation/add", function (req, res) {
    console.log("observation add");
    if (!req.isAuthenticated()) {
      return res.send(null);
    }

    var saveObservation = async function (observation, req, res) {
      //observation.user = req.user.id;
      const user = await User.findOne({ email: req.user.email });
      observation.user = user;
      console.log("user: ", user);

      // time specific (assume date is formatted)
      console.log("date is without new Date: ", req.query.date);
      observation.date = req.query.date;

      // place specific
      console.log("observation country: " + req.query.country);
      observation.country = req.query.country;
      observation.countryPart = req.query.countryPart;
      observation.place = req.query.place;
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

      // insect specific
      observation.count = req.query.count;
      if (!req.query.insectId) {
        // search by latin name
        console.log("searching by latin name");
        Insect.findOne(
          { latinName: req.query.latinName },
          function (err, insect) {
            if (err) {
              console.log(
                "searching insect by latin name failed before saving observation"
              );
              throw err;
            }
            console.log("found insect by its latin name, ", insect);
            observation.insect = insect;
            performSave(observation, res);
          }
        );
      } else {
        console.log("searching insect by its id, ", req.query.insectId);
        // search insect by id
        Insect.findOne({ _id: req.query.insectId }).exec(function (
          err,
          insect
        ) {
          if (err) {
            console.error(
              "couldn't find the insect by its id before saving observation"
            );
            console.log("insect: ", insect);
            throw err;
          }
          console.log("found insect by its id, insect:", insect);

          observation.insect = insect;
          // save observation
          performSave(observation, res);
        });
      }
    };

    var performSave = function (observation, res) {
      console.log("observation: ", observation);
      console.log(
        "observation date without new date: ",
        observation.date.toString()
      );
      observation.save(function (err) {
        if (err) {
          console.log('couldn"t save observation ', err);
          throw err;
        }
        console.log("sending confirmation to the client");
        return res.send({ msg: true });
      });
    };

    var observation = new Observation();

    // initialization
    var latinName = req.query.latinName;
    var insectId = req.query.insectId;

    console.log("checking insect id");
    console.log("insectId: " + insectId);

    if (insectId !== null || latinName !== null) {
      console.log("starting to save insect");
      saveObservation(observation, req, res);
    } else {
      console.log("no latinname or insect id provided");
      return res.send(null);
    }
  });

  app.delete("/insect/delete", function (req, res) {
    console.log("compendium deletes");

    console.log(req.query.insectId);
    Compendium.find()
      .populate({
        path: "insects",
        match: { _id: req.query.insectId },
      })
      .exec(function (err, results) {
        if (err) {
          console.error("got an error");
          throw err;
        }
        console.log("results: ", results);
        // perform filtering
        const filteredCompendiums = results.filter((compendium) => {
          return compendium.insects.length > 0;
        });
        if (filteredCompendiums.length > 0) {
          console.log("result.length: ", results.length);
          console.log("found compendium(s) with the given insect");
          return res.send({ msg: false });
        }
        console.log("safe to delete the insect");

        Insect.deleteOne({ _id: req.query.insectId }, function (err, result) {
          if (err) throw err;
          console.log("insect deletion result: ", result);
          return res.send({ msg: true });
        });
      });
  });

  app.get("/observation/browse", function (req, res) {
    console.log("observation browse");
    var query = Observation.find();

    // initialization

    // params: date, country, location, place, organicfarm, name, language
    console.log("checking for dates");
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;
    console.log("startdate: " + startDate + ", enddate: " + endDate);
    console.log("checking for place");
    var country = req.query.country;
    var countryPart = req.query.countryPart;

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

    // place specific query
    console.log("narrowing observation place search");

    console.log("organicFarm == 'false'");
    console.log(organicFarm == "false");
    console.log("organicFarm == 'true'");
    console.log(organicFarm == "true");

    if (country) {
      console.log("by country: " + country);

      query.where("country").equals(country);
    }

    if (countryPart) {
      console.log("by countryPart: " + countryPart);
      query.where("countryPart").equals(countryPart);
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

    //time specific search
    var startDate;
    var endDate;

    startDate = new Date(req.query.startDate);
    endDate = new Date(req.query.endDate);

    console.log("startDate: " + startDate + " and enddate: " + endDate);

    if (
      startDate.getFullYear() == endDate.getFullYear() &&
      startDate.getMonth() == endDate.getMonth() &&
      startDate.getDate() == endDate.getDate()
    ) {
      console.log("startdate equals enddate.");
      startDate.setDate(startDate.getDate() - 1);
    }

    console.log(
      "querying within a time range of: " + startDate + " - " + endDate
    );
    query.where({ date: { $gte: startDate, $lte: endDate } });

    // name and language

    // perform first query without considering insect specific details
    query = query.populate({
      path: "insect",
    });
    query.exec(function (err, observations) {
      if (err) {
        console.log(
          "place and time specific observation search throw err:",
          err
        );
        throw err;
      }
      console.log("finished searching observations by place and time.");
      console.log("observations[0]: ", observations[0]);
      if (observations.length > 0)
        console.log("observations[0].insect", observations[0].insect);

      // search narrowed also by insect category
      if (req.query.category) {
        console.log("search narrowed also by category: ", req.query.category);
        observations = observations.filter(
          (observation) => observation.insect.category === req.query.category
        );
      } else if (name) {
        console.log("search narrow also by name: ", name);
        console.log("language: ", req.query.language);

        const observationsByLatinName = observations.filter(
          (observation) => observation.insect.latinName === name
        );

        console.log("searching by other language than latin");
        const observationsByNonLatinName = observations.filter(
          (observation) => {
            var foundTranslation = false;
            observation.insect.translations.forEach((translation) => {
              if (translation.name === name) {
                console.log("found translation");
                foundTranslation = true;
              }
            });
            return foundTranslation;
          }
        );
        console.log("joining the translation arrays");
        // join the two arrays
        observations = [
          ...observationsByNonLatinName,
          ...observationsByLatinName,
        ];
      }

      return res.send(observations);
    });
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
        return res.send(req.user);
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
      return res.send(user);
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
