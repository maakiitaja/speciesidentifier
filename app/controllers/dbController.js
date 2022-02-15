var Insect = require("./../models/insect");
var sharp = require("sharp");
var path = require("path");
var fs = require("fs");
const catchAsync = require("./../utils/catchAsync");

exports.populate = async function (req, res) {
  console.log("populate_db start");

  console.log("reading insects json");
  const data = fs.readFileSync(
    __dirname + "/../public/insects/insects.json",
    "utf8"
  );

  var insects = JSON.parse(data);
  var i = 0;
  console.log("insects.length: " + insects.length);
  var insectLength = insects.length;
  console.log(insects[0]);

  for (var i = 0; i < insects.length; i++) {
    var insect = insects[i];

    var newInsect = new Insect();

    // newInsect.translations = [];
    // console.log("writing translations");
    // for (var j = 0; j < insect["translations"].length; j++) {
    //   if (insect.translations[j].name) {
    //     // for case insensitive sorting
    //     insect.translations[j].name =
    //       insect.translations[j].name.charAt(0).toUpperCase() +
    //       insect.translations[j].name.slice(1);
    //   }

    //   newInsect.translations.push({
    //     language: insect["translations"][j].language,
    //     name: insect["translations"][j].name,
    //   });
    // }
    // console.log("newinsect translations: " + newInsect.translations);
    // newInsect.userId = "1"; // default
    // // turn the first character to uppercase
    // var tmpLatinName = insect["latinName"];
    // tmpLatinName = tmpLatinName.charAt(0) + tmpLatinName.slice(1);
    // newInsect.latinName = tmpLatinName;
    // newInsect.legs = insect["legs"];
    // newInsect.primaryColor = insect["primaryColor"];
    // newInsect.secondaryColor = insect["secondaryColor"];
    // newInsect.wiki = insect["wiki"];
    // newInsect.images = [];
    // newInsect.category = insect["category"];

    // console.log(
    //   "insect[images]:",
    //   insect.images,
    //   " with length: ",
    //   insect.images.length
    // );

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

    //thumb picture (uncomment to generate thumb picture)

    // await Promise.all(
    //   newInsect.images.map(async (image, i) => {
    //     const srcPath =
    //       __dirname + path.sep + ".." + path.sep + "public" + path.sep + image;
    //     const filename = srcPath + "_thumb.jpg";
    //     console.log("file (resizing): ", image);
    //     await sharp(srcPath)
    //       .resize(150, 150, { fit: "inside" })
    //       .toFormat("jpeg")
    //       .jpeg({ quality: 90 })
    //       .toFile(filename);
    //     console.log("resizing done", image);
    //   })
    // );

    // legacy thumb picture
    // gm(srcPath)
    //   .resize(150, 150)
    //   .write(srcPath + "_thumb.jpg", function (err) {
    //     if (err) console.log(err);
    //     else
    //       console.log(
    //         "resized file: " +
    //           __dirname +
    //           "/public/" +
    //           newInsect["images"][j]
    //       );
    //   });
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

    //     newInsect.save(function (err) {
    //       if (err) throw err;
    //       console.log("Insect saved");
    //       console.log(newInsect);
    //     });
    //   }
    // });

    //     res.redirect("/#/main");
    //   }
    // );
  }
  res.redirect("/#/main");
};

exports.linkUserToInsects = catchAsync(async (req, res, next) => {
  console.log("linkUserToInsects start");
  const docs = await Insect.updateMany(
    { userId: undefined },
    { $set: { userId: "620bfcc0e9f5a7300b9d6a02" } }
  );
  if (docs.length > 0) {
    console.log("successfully updated:", docs.length);
  } else console.log("no insects were updated");
  res.redirect("/#/main");
});
