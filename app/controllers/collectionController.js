var Insect = require("./../models/insect");
var Compendium = require("./../models/compendium");

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
