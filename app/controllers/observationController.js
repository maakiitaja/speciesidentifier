var Insect = require("./../models/insect");
var User = require("./../models/user");
var Observation = require("./../models/observation");
const catchAsync = require("./../utils/catchAsync");
exports.browse = function (req, res) {
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

  if (country && country !== "All") {
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

  console.log("by placetype");

  if (organicFarm == "true") {
    console.log("organicfarm");
    query.where("organicFarm").equals(true);
  } else if (nonOrganicFarm == "true") {
    console.log("nonorganicfarm");
    query.where("organicFarm").equals(false);
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
  console.log(
    "req.query.latitude: ",
    req.query.latitude,
    "req.query.longitude: ",
    req.query.longitude
  );
  // by location
  if (req.query.latitude && req.query.longitude && req.query.radius) {
    const unit = "km";
    const radius =
      unit === "mi" ? req.query.radius / 3963.2 : req.query.radius / 6378.1;
    query.where({
      location: {
        $geoWithin: {
          $centerSphere: [[req.query.longitude, req.query.latitude], radius],
        },
      },
    });
  }

  // name and language

  // perform first query without considering insect specific details
  query = query.populate({
    path: "insect",
  });
  query.exec(function (err, observations) {
    if (err) {
      console.log("place and time specific observation search throw err:", err);
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
};

exports.add = function (req, res) {
  console.log("observation add");

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

    if (req.query.organicFarm == "true" || req.query.nonOrganicFarm == "true") {
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

    console.log("latitude: ", req.query.latitude);
    console.log("longitude: ", req.query.longitude);
    observation.location.coordinates.push(req.query.longitude);
    observation.location.coordinates.push(req.query.latitude);

    // insect specific
    observation.count = req.query.count;
    if (!req.query.insectId) {
      // search by latin name
      console.log("searching by latin name, ", req.query.latinName);
      var latinName = req.query.latinName;
      // for case insensitive comparision
      if (latinName) {
        latinName = latinName.charAt(0).toUpperCase() + latinName.substring(1);
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
      Insect.findOne({ _id: req.query.insectId }).exec(function (err, insect) {
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
};

exports.getAll = function (req, res) {
  console.log("observation list");
  var query = Observation.find({}).populate({ path: "insect" });
  query.exec(function (err, observations) {
    if (err) {
      console.log("observation list err:", err);
      throw err;
    }
    console.log("found observations: ", observations);
    return res.json(observations);
  });
};

exports.getObservationsWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng.",
        400
      )
    );
  }

  const observations = await Observation.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    results: observations.length,
    data: {
      data: observations,
    },
  });
});
