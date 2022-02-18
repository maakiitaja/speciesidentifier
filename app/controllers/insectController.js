const multer = require("multer");
const sharp = require("sharp");
const AppError = require("./../utils/appError");
var User = require("./../models/user");
var Insect = require("./../models/insect");
var Compendium = require("./../models/compendium");
const catchAsync = require("./../utils/catchAsync");

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    console.log("destination: " + __dirname + "/../public/images/");
    callback(null, __dirname + "/../public/images/");
  },

  filename: function (req, file, callback) {
    console.log("renaming file.");
    console.log("file name: " + file.originalname);
    const now = new Date();
    console.log("current time: ", now.getTime());
    const renamedFilename =
      req.user.id + "-" + now.getTime() + "-" + file.originalname;

    callback(null, renamedFilename);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

var upload = multer({
  limits: {
    fieldNameSize: 500,
    fileSize: 1048576, //  1048576
  },
  storage: storage,
  fileFilter: multerFilter,
}).fields([
  {
    name: "userPhotos",
    maxCount: 5,
  },
  { name: "userPhotos2", maxCount: 5 },
]);

exports.uploadList = catchAsync(async (req, res, next) => {
  console.log("userId: " + req.user.id);
  const totalCount = await Insect.find({ userId: req.user.id }).count();
  console.log("totalCount: " + totalCount);
  if (totalCount === 0) {
    return res.send({ data: undefined, totalCount: 0 });
  }
  const insects = await Insect.find({ userId: req.user.id })
    .sort("category")
    .skip(req.query.page * req.query.itemsPerPage)
    .limit(req.query.itemsPerPage);

  console.log("found nro of insects: " + insects.length);
  return res.send({ data: insects, totalCount: totalCount });
});

exports.insert = function (req, res) {
  upload(req, res, function (err) {
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
        console.log("files: ", files);
        await Promise.all(
          files.map(async (file, i) => {
            const filename = file.filename + "_thumb.jpg";
            console.log("file (resizing): ", file);
            await sharp(file.destination + file.filename)
              .resize(150, 150, { fit: "inside" })
              .toFormat("jpeg")
              .jpeg({ quality: 90 })
              .toFile(file.destination + filename);
            console.log("resizing done");
          })
        );
      }

      if (isUpload == "1") {
        console.log("saving insect");

        insect.save(function (err) {
          if (err) throw err;
          console.log("Insect saved");
          console.log("insect: " + insect);
          return res.redirect("/#/insect/uploadList?fileuploadsuccess=1");
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
        // update all collections with the given insect
        await Compendium.updateMany(
          { insects: insect._id },
          { $inc: { version: 1 } }
        );
        console.log("insect updated");
        try {
          return res.redirect(
            "/#/insect/uploadList?fileuploadsuccess=1&page=" + req.body.page
          );
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
};

exports.delete = function (req, res) {
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
};

exports.search = async function (req, res, next) {
  console.log("search handler");
  var primaryColor = req.query.primaryColor;
  var secondaryColor = req.query.secondaryColor;
  var category = req.query.category;
  var legs = req.query.legs;
  const page = req.query.page;
  const itemsPerPage = req.query.itemsPerPage;

  // for case insensitive comparision
  if (req.query.name) {
    console.log("turning first letter into uppercase");
    req.query.name =
      req.query.name.charAt(0).toUpperCase() + req.query.name.slice(1);
  }

  console.log(
    "primaryColor: " +
      req.query.primaryColor +
      " ,secondaryColor: " +
      req.query.secondaryColor +
      ", legs:" +
      req.query.legs
  );
  console.log("latinName: " + req.query.latinName);

  const filterSearch = function (req) {
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
    return query;
  };

  const totalCount = await filterSearch(req).count();
  console.log("total count: " + totalCount);
  if (totalCount > 0) {
    const query = filterSearch(req);
    query.skip(page * itemsPerPage).limit(itemsPerPage);

    query.exec(function (err, insects) {
      if (err) throw err;
      console.log(insects[0]);

      return res.status(200).send({ insects: insects, totalCount: totalCount });
    });
  } else {
    console.log("no search results");
    return res.send([]);
  }
};

exports.loadInsectsByUser = function (req, res) {
  Insect.find({ userId: req.query.userId }).exec(function (err, results) {
    if (err) throw err;
    console.log("results: " + results);

    return res.send(results);
  });
};

exports.latinNameExists = function (req, res) {
  console.log("latinNameExist function req.query: ", req.query);
  // case insensitive
  var latinName = req.query.latinName;
  latinName = latinName.charAt(0).toUpperCase() + latinName.substring(1);

  Insect.findOne({ latinName: latinName }).exec(function (err, insect) {
    if (err) throw err;
    if (insect) {
      console.log("found latinname");
      return res.send({ msg: true });
    } else {
      console.log('didn"t find latinname');
      return res.send({ msg: false });
    }
  });
};

exports.addLatinName = function (req, res) {
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
};

exports.findInsectsByUser = catchAsync(async (req, res, next) => {
  console.log("findInsectsByUser start");
  await Compendium.find({ _user: req.user.id });
});
