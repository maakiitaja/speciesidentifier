var Insect = require("./../models/insect");
var Compendium = require("./../models/compendium");
const catchAsync = require("./../utils/catchAsync");

exports.searchItem = function (req, res) {};

exports.remove = function (req, res) {
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
      compendium.version += 1;
      compendium.save(function (err) {
        console.log("compendium:" + compendium);
        console.log("saved compendium. ");
        return res.send({ msg: true });
      });
    } else {
      console.log("failed to locate insect in compendium");
      return res.send({ msg: false });
    }
  });
};

exports.removeMany = function (req, res) {
  console.log("/collection/removemany");

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
    console.log("insectsTmp: ", insectsTmp);
    insectsTmp = insectsTmp.map((insectId) => insectId.toString());
    console.log("insectsTmp after: ", insectsTmp);
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
        console.log("id: ", id);
        var removeInd = insectsTmp.indexOf(id);
        console.log("removeInd: ", removeInd);
        if (removeInd >= 0) {
          console.log("found a match between remote and local collection");
          insectsTmp.splice(removeInd, 1);
        }
      });
    }

    console.log("assigning insects");
    compendium.insects = insectsTmp;
    compendium.version += insectsTmp.length;
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
};

exports.create = catchAsync(async (req, res, next) => {
  console.log("collection create start");
  const collection = await Compendium.findOne({ _user: req.user.id });
  console.log("collection is:", collection);
  if (collection) {
    // collection already exists
    return res.status(409).send({ msg: "collection already exists" });
  }
  const newCollection = await Compendium.create({ _user: req.user.id });
  console.log("new collection: ", newCollection);
  if (newCollection) {
    return res.status(200).send({ msg: "New Collection created" });
  } else {
    return res.status(500).send({ msg: "New collection creation failed" });
  }
});

exports.remoteVersion = catchAsync(async (req, res, next) => {
  console.log("getting remote compendium version");
  const collection = await Compendium.findOne({ _user: req.user.id }).select(
    "version"
  );
  if (!collection) {
    return res
      .status(404)
      .send({ collection: null, msg: "Couldn't find collection" });
  }
  return res.status(200).send({ collection: collection });
});

// returns new remote items, new local items and updated remote items
exports.syncInfo = catchAsync(async (req, res, next) => {
  console.log("sync info start");
  console.log("body:", req.body);
  let localInsects = req.query.localInsects;
  console.log("localInsects:", localInsects);

  localInsects = JSON.parse(Buffer.from(localInsects, "base64"));
  console.log("decoded localInsects:", localInsects);

  let localInsectsIds = localInsects.map((el) => el._id);
  if (localInsectsIds === undefined || localInsects === null) {
    localInsectsIds = [];
  }

  const remoteCollection = await Compendium.findOne({
    _user: req.user.id,
  }).populate({
    path: "insects",
    select: "updatedAt",
  });

  const remoteInsects = remoteCollection.insects;
  console.log("remoteCollection:", remoteCollection);

  const remoteInsectsIds = remoteInsects.map((el) => el._id.toString());
  console.log("remoteInsectsIds:", remoteInsectsIds);
  console.log("remoteInsects.length: ", remoteInsects.length);

  if (!remoteInsects || remoteInsects.length === 0) {
    return res.status(404).send({ msg: "no remote insects found" });
  }
  console.log("localInsectIds:", localInsectsIds);
  const newLocalInsectsIds = localInsectsIds.filter(
    (localInsectId) => !remoteInsectsIds.includes(localInsectId)
  );

  const newRemoteInsectsIds = remoteInsectsIds.filter(
    (remoteInsectId) => !localInsectsIds.includes(remoteInsectId)
  );

  const updatedRemoteInsectsTmp = [];
  remoteInsects.forEach(function (remoteInsect) {
    const localInsect = localInsects.find(
      (el) => el._id === remoteInsect._id.toString()
    );
    console.log("localInsect:", localInsect);
    if (localInsect) {
      console.log("remoteInsect.updatedAt ", remoteInsect.updatedAt.toString());
      const remoteDate = new Date(remoteInsect.updatedAt);
      const localDate = new Date(localInsect.updatedAt);
      console.log("localDate:", localDate, " remoteDate: ", remoteDate);
      if (remoteDate > localDate) {
        console.log("pushing to updated remote insects");
        updatedRemoteInsectsTmp.push(remoteInsect);
      }
    }
  });

  // get updated remote insects
  console.log("updatedRemoteInsects.length: ", updatedRemoteInsectsTmp.length);
  let updatedRemoteInsects = [];
  if (updatedRemoteInsectsTmp.length > 0) {
    const updatedRemoteInsectIds = updatedRemoteInsectsTmp.map((el) => el._id);
    updatedRemoteInsects = await Insect.find({
      _id: { $in: updatedRemoteInsectIds },
    });
  }

  // get new remote insects
  let newRemoteInsects = [];
  if (newRemoteInsectsIds.length > 0) {
    newRemoteInsects = await Insect.find({
      _id: { $in: newRemoteInsectsIds },
    });
  }

  res.status(200).send({
    newRemoteInsects: newRemoteInsects,
    updatedRemoteInsects: updatedRemoteInsects,
    newLocalInsectsIds: newLocalInsectsIds,
  });
});

exports.list = function (req, res) {
  console.log("collection/list start");

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

      if (ids.length === 0) {
        return res.send([]);
      }

      Insect.find()
        .where("_id")
        .in(ids)
        .sort("category")
        .exec(function (err, results) {
          if (err) throw err;
          console.log("results: " + results);
          if (results.length === 0) {
            results = "insect(s) were removed from database";
          }
          return res.send(results);
        });
    }
  });
};

exports.insert = function (req, res) {
  console.log("collection insert");

  // find the user's collection
  console.log("insectId: " + req.query.insectId);
  Compendium.findOne({ _user: req.user.id }, function (err, compendium) {
    console.log("found a user's compendium");
    if (compendium) {
      console.log("updating a collection");
      // watch for duplicates
      if (!compendium.insects.includes(req.query.insectId)) {
        console.log("not a duplicate id: ", req.query.insectId);
        compendium.insects.push(req.query.insectId);
        compendium.version += 1;
      } else {
        console.log("found duplicate with id:", req.query.insectId);
        return res.send({ msg: false });
      }

      console.log("updated compendium: " + compendium);
      compendium.save(function (err) {
        if (err) throw err;
        console.log("updated compendium");
        return res.send({ msg: true });
      });
    } else {
      console.log("couldn't find user's compendium");
      return res.send(null);
    }
  });
};

exports.insertMany = function (req, res) {
  console.log("collection/insertmany");

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
        var ind = compendium.insects.find((insect) => insect._id === insectId);
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

      comp.version += resultInsects.length;
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
};

exports.search = catchAsync(async (req, res, next) => {
  console.log("collection search");
  const collection = await Compendium.findOne({ _user: req.user.id }).populate(
    "insects"
  );

  if (!collection || collection?.insects?.length === 0) {
    console.log("collection empty or no insects found");
    return res.status(404).send({ msg: "Collection empty" });
  }
  const resInsects = [];
  collection.insects.forEach(function (insect) {
    let result;
    if (insect.category === req.query.category) {
      result = insect;
      if (req.query.primaryColor) {
        if (insect.primaryColor === req.query.primaryColor) {
          result = insect;
        } else result = null;
      }
      if (req.query.secondaryColor && result) {
        if (insect.secondaryColor === req.query.secondaryColor) result = insect;
        else result = null;
      }
    }
    if (result) resInsects.push(result);
  });
  console.log("succesfully filtered");
  return res.status(200).send({ insects: resInsects });
});
