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
const compendium = require("./models/compendium");

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
        console.log(insects[0]);

        // empty the collection
        Insect.remove(function (err) {
          if (err) {
            console.log("got error while removing insects, err:", err);
            throw err;
          }

          for (var i = 0; i < insects.length; i++) {
            var insect = insects[i];

            var newInsect = new Insect();

            newInsect.translations = [];
            console.log("writing translations");
            for (var j = 0; j < insect["translations"].length; j++) {
              if (insect.translations[j].name) {
                // for case insensitive sorting
                insect.translations[j].name =
                  insect.translations[j].name.charAt(0).toUpperCase() +
                  insect.translations[j].name.slice(1);
              }

              newInsect.translations.push({
                language: insect["translations"][j].language,
                name: insect["translations"][j].name,
              });
            }
            console.log("newinsect translations: " + newInsect.translations);
            newInsect.userId = "1"; // default
            // turn the first character to uppercase
            var tmpLatinName = insect["latinName"];
            tmpLatinName = tmpLatinName.charAt(0) + tmpLatinName.slice(1);
            newInsect.latinName = tmpLatinName;
            newInsect.legs = insect["legs"];
            newInsect.primaryColor = insect["primaryColor"];
            newInsect.secondaryColor = insect["secondaryColor"];
            newInsect.wiki = insect["wiki"];
            newInsect.images = [];

            console.log(
              "insect[images]:",
              insect.images,
              " with length: ",
              insect.images.length
            );

            for (var j = 0; j < insect.images.length; j++) {
              //console.log("image name: " + imagesTmp[ind]);
              var image = insect.images[j];
              if (path.sep === "\\") {
                console.log("path seperator is \\");

                image = image.split("/").join("\\");
              }
              newInsect.images.push(image);
            }
            console.log("newInsect.images: " + newInsect.images);

            newInsect.category = insect["category"];

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
    console.log("search handler");
    var primaryColor = req.query.primaryColor;
    var secondaryColor = req.query.secondaryColor;
    var category = req.query.category;
    var legs = req.query.legs;
    // for case insensitive comparision
    if (req.query.name) {
      console.log("turning first letter into uppercase");
      req.query.name =
        req.query.name.charAt(0).toUpperCase() + req.query.name.slice(1);
    }
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
  // return all the items in the user's collection
  app.get("/collection/list", function (req, res) {
    console.log("collection/list start");
    if (!req.isAuthenticated()) {
      console.log("not authenticated");
      return res.send(null);
    }

    Compendium.findOne({ _user: req.user.id }, function (err, compendium) {
      if (err) {
        console.log(err);
      }
      if (compendium === null) {
        // create a new collection without items
        console.log("creating a new collection");
        var newCompendium = new Compendium();
        newCompendium._user = req.user.id;
        console.log("newCompendium.insects: " + newCompendium.insects);

        newCompendium.save(function (err, compendium) {
          if (err) throw err;
          console.log("created a new compendium, ", compendium);
          return res.send(null);
        });
      } else {
        console.log("found compendium: " + compendium);
        console.log("insects in compendium[0]: " + compendium.insects[0]);
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
            if (results.length === 0) {
              results = null;
            }
            return res.send(results);
          });
      }
    });
  });

  app.delete("/insect/removemany", function (req, res) {
    console.log("/insect/removemany");
    if (!req.isAuthenticated()) {
      console.log("not authenticated");
      return res.send("not authenticated");
    }

    Compendium.findOne({ _user: req.user.id }, function (err, compendium) {
      if (err) {
        throw err;
      }
      if (compendium === undefined || !compendium) {
        console.log('couldn"t find compendium');
        return res.send(null);
      }

      console.log("compendium.insects.length: " + compendium.insects.length);
      var insects = compendium.insects;
      var insectsTmp = [...insects];
      var tmp;
      var removeInsectIds = req.query.removeInsectIds;
      console.log(
        "insectIds before check to string(): " + removeInsectIds.toString()
      );
      if (typeof removeInsectIds === "string") {
        console.log("one insect id was passed");
        tmp = [];
        tmp.push(removeInsectIds.toString());
        removeInsectIds = tmp;
      }
      console.log("removeInsectIds: ", removeInsectIds);

      // remove insects from compendium
      if (insects !== undefined && insects.length > 0) {
        removeInsectIds.forEach(function (id) {
          var removeInd = insectsTmp.indexOf(id);
          if (removeInd >= 0) {
            console.log("found a match between remote and local collection");
            insectsTmp.splice(removeInd, 1);
          }
        });
      }

      console.log("assigning insects");
      compendium.insects = insectsTmp;
      console.log("compendium before removal of items: ", compendium);
      // update
      compendium.save(function (err, comp) {
        if (err) {
          throw err;
        }

        console.log("saved compendium after removing many items");
        console.log("compendium: " + comp);
        res.send({ msg: true });
      });
    });
  });

  app.delete("/collection/remove", function (req, res) {
    console.log("collection remove start");

    console.log("searching user's compendium");
    Compendium.findOne({ _user: req.user.id }, function (err, compendium) {
      if (err) {
        throw err;
      }

      console.log("found compendium: " + compendium);
      console.log("compendium.insects.length: " + compendium.insects.length);
      if (compendium == null) {
        console.log("send fail");
        return res.send("fail");
      }

      var success = false;
      var insectId = req.query.insectId;

      console.log("insectId: ", insectId);
      console.log("compendium.insects", compendium.insects);
      console.log(
        "compendium.insects[0].toString",
        compendium.insects[0].toString()
      );

      for (var i = 0; i < compendium.insects.length; i++) {
        if (compendium.insects[i].toString() === insectId) {
          compendium.insects.splice(i, 1);

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
      if (!req.isAuthenticated()) {
        return res.send("not authenticated");
      }

      if (err) {
        console.log("got upload error, file limit exceeded?, err: ", err);
        // would need to redirect to error view
        return res.redirect("/#/fileuploaderror");
      }

      console.log("uploading or modifying insect");
      console.log("isupload: " + req.body.isUpload);
      console.log("insectId: " + req.body.insectId);
      console.log("userId:" + req.user.id);

      var isUpload = req.body.isUpload;

      var firstLetterToUppercase = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      var handleUpload = async function (req, res, insect) {
        console.log("wiki: " + req.body.wiki);
        insect.latinName = firstLetterToUppercase(req.body.latinName);
        insect.legs = req.body.legs;
        insect.primaryColor = req.body.primaryColor;
        insect.secondaryColor = req.body.secondaryColor;
        insect.wiki = req.body.wiki;
        insect.category = req.body.category;
        insect.userId = req.user.id;
        console.log("insect.translations: " + insect.translations);
        var enName = firstLetterToUppercase(req.body.enName);
        var fiName = firstLetterToUppercase(req.body.fiName);

        if (isUpload) {
          console.log("adding new translations");
          console.log(insect);
          insect.translations = [];

          insect.translations.push({ language: "en", name: enName });
          insect.translations.push({ language: "fi", name: fiName });
          insect.translations.push({
            language: "Latin",
            name: insect.latinName,
          });
        } else {
          console.log("updating names.");

          insect.translations[0].name = enName;
          insect.translations[1].name = fiName;
          insect.translations[2].name = insect.latinName;
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
            return res.redirect("/#/main?fileuploadsuccess=1");
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
            return res.redirect("/#/main?fileuploadsuccess=1");
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
    // case insensitive
    var latinName = req.body.latinName;
    latinName = latinName.charAt(0).toUpperCase() + latinName.substring(1);

    Insect.findOne({ latinName: latinName }).exec(function (err, insect) {
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
        console.log("searching by latin name, ", req.query.latinName);
        var latinName = req.query.latinName;
        // for case insensitive comparision
        if (latinName) {
          latinName =
            latinName.charAt(0).toUpperCase() + latinName.substring(1);
        }

        Insect.findOne({ latinName: latinName }, function (err, insect) {
          if (err) {
            console.log(
              "searching insect by latin name failed before saving observation"
            );
            throw err;
          }
          console.log("found insect by its latin name, ", insect);
          if (!insect) {
            console.log('couldn"t find insect');
            return res.send(null);
          }
          observation.insect = insect;
          performSave(observation, res);
        });
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

  app.get("/observation/list", function (req, res) {
    console.log("observation list");
    var query = Observation.find({}).populate({ path: "insect" });
    query.exec(function (err, observations) {
      if (err) {
        console.log("observation list err:", err);
        throw err;
      }
      console.log("found observations: ", observations);
      return res.send("success");
    });
  });

  app.delete("/insect/delete", function (req, res) {
    console.log("insect/delete");

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

  app.get("/observation/browse", async function (req, res) {
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
      console.log;
      if (observations.length > 0) {
        console.log("observations[0]:", observations);
        console.log("observations[0].insect", observations[0].insect);
      } else {
        return res.send(null);
      }

      // search narrowed also by insect category
      if (req.query.category) {
        console.log("search narrowed also by category: ", req.query.category);
        observations = observations.filter((observation) => {
          if (!observation.insect) {
            return false;
          }
          return observation.insect.category === req.query.category;
        });

        return res.send(observations);
      } else if (name) {
        console.log("search narrowed also by name: ", name);
        console.log("language: ", req.query.language);
        var firstObs = observations[0]._id.toString();

        // another query based on name { $and: [{ age: { $gt: 2 } }, { age: { $lte: 4 } }] }
        //
        //  $and: [{ _id: { $in: ids } }, { country: { $eq: country } }],
        // $and: [{ _id: { $in: ids } }, { 'insect.latinName': { $eq: 'Aglais io' } }],

        //  {'children.age': {$gte: 18}},
        //{children:{$elemMatch:{age: {$gte: 18}}}})
        // {insect: {$elemMatch: {latinName: {$eq: 'Aglais io'}}}}

        // var observationsByNameQuery = Observation.find(
        //   {
        //     $and: [
        //       { _id: { $in: ids } },
        //       { "insect.latinName": { $eq: "Aglais io" } },
        //     ],
        //   },
        //   { insect: { $elemMatch: { latinName: { $eq: "Aglais io" } } } }
        // ).populate({
        //   path: "insect",
        // });

        console.log("searching by any language");
        // for case insensitive comparision
        name = name.charAt(0).toUpperCase() + name.slice(1);

        observations = observations.filter((observation) => {
          var foundTranslation = false;
          if (!observation.insect) {
            return false;
          }
          observation.insect.translations.forEach((translation) => {
            if (translation.name === name) {
              console.log("found translation");
              foundTranslation = true;
            }
          });
          return foundTranslation;
        });

        return res.send(observations);
      } else {
        console.log("returning results");
        return res.send(observations);
      }
    });
  });

  app.post("/collection/insertmany", function (req, res) {
    console.log("collection/insertmany");

    if (!req.isAuthenticated()) {
      console.log("not authenticated");
      return res.send("not authenticated");
    }
    //var latinNames = req.query.latinNames;
    var insectIds = req.query.insectIds;
    // of format {_id, updatedAt}
    var resultInsects = [];

    if (!insectIds) {
      console.log("no params were provided");
      return res.send(null);
    }
    var tmp;
    console.log("insectIds before check: " + insectIds);
    console.log("insectIds before check to string(): " + insectIds.toString());
    if (typeof insectIds === "string") {
      console.log("one insect id was passed");
      tmp = [];
      tmp.push(insectIds.toString());
      insectIds = tmp;
    }
    console.log("insectIds after check: ", insectIds);
    var query = Compendium.find().where("_user").equals(req.user.id);
    query.populate({ path: "insects", select: "_id updatedAt" });

    query.exec(async function (err, compendium) {
      if (err) {
        throw err;
      }

      if (!compendium) {
        console.log('couldn"t find user"s collection');
        return res.send(null);
      }

      console.log("insectIds: ", insectIds);
      console.log("compendium: ", compendium);

      insectIds.forEach(function (insectId, ind) {
        var updatedAt;
        if (compendium.insects) {
          var ind = compendium.insects.find(
            (insect) => insect._id === insectId
          );
          if (ind) {
            updatedAt = compendium.insects[ind].updatedAt;
          }
        }

        console.log("updatedAt", updatedAt);

        // update the result insects, watch for duplicates
        if (compendium.insects) {
          if (!compendium.insects.includes(insectId)) {
            console.log("inserting a new collection item, id:", insectId);
            resultInsects.push({
              _id: insectId,
              updatedAt: updatedAt === undefined ? new Date() : updatedAt,
            });
          } else {
            console.log("found duplicate in collection for id: ", insectId);
          }
        } else {
          console.log("compendium is empty");

          resultInsects.push({
            _id: insectId,
            updatedAt: updatedAt === undefined ? new Date() : updatedAt,
          });
        }
      });

      // update the collection
      Compendium.findOne({ _user: req.user.id }).exec(function (err, comp) {
        if (err) {
          console.log("error occurred after finding the compendium,err", err);
          throw err;
        }

        console.log("compendium after plain find", comp);

        // construct result object of form insects : [{_id, updatedAt}] and update the existing compendium
        var resultObj = [];
        if (comp.insects === undefined) {
          console.log("initializing compemdium insects");
          comp.insects = [];
        }
        console.log("before looping");
        resultInsects.forEach(function (insect) {
          console.log("resultInsects.foreach, insect:", insect);
          resultObj.push({ _id: insect._id, updatedAt: insect.updatedAt });

          comp.insects.push({ _id: insect._id });
        });

        comp.save(function (err, comp) {
          if (err) {
            console.log("error occurred after saving the compendium,err", err);
            throw err;
          }
          console.log("saved compendium, ", comp);
          return res.send({ msg: true, compendium: resultObj });
        });
      });
    });
  });

  app.post("/collection/insert", function (req, res) {
    console.log("collection insert");
    console.log("user: " + req.user);

    if (!req.isAuthenticated()) {
      return res.send("not authenticated");
    }

    // find the user's collection
    console.log("insectId: " + req.query.insectId);
    Compendium.findOne({ _user: req.user.id }, function (err, compendium) {
      console.log("found a user's compendium");
      if (compendium) {
        console.log("updating a collection");
        compendium.insects.push(req.query.insectId);
        console.log("updated compendium: " + compendium);
        compendium.save(function (err) {
          if (err) throw err;
          console.log("updated compendium");
          return res.send({ msg: true });
        });
      } else {
        console.log("couldn't find user's compendium");
        return res.send(null);
        // // create a new collection
        // console.log("creating a new collection");
        // var newCompendium = new Compendium();
        // newCompendium._user = req.user.id;
        // console.log("newCompendium.insects: " + newCompendium.insects);
        // newCompendium.insects.push(req.query.insectId);
        // //newCompendium.insects.push(req.params.insectId);
        // //newCompendium._user=req.user.id;
        // console.log("newCompendium: " + newCompendium);
        // newCompendium.save(function (err) {
        //   if (err) throw err;
        //   console.log("saved compendium item");
        // });
      }
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
  app.get("/insect/addlatinname", function (req, res) {
    // get all the insects
    var query = Insect.find({}).select(
      "latinName category wiki legs primaryColor secondaryColor translations images -_id"
    );
    query.exec(function (err, insects) {
      if (err) {
        console.log(err);
        throw err;
      }

      insects.forEach(function (insect) {
        insect.translations.push({
          language: "Latin",
          name: insect.latinName,
        });
      });

      console.log("found insects: " + JSON.stringify(insects));
      return res.redirect("/#/main");
    });
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
