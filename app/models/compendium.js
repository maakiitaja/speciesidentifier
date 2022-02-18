var mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;
var Schema = mongoose.Schema;
//module.exports = mongoose.model("Insect", InsectSchema);

var CompendiumSchema = new Schema(
  {
    _user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    insects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Insect" }],
    version: { type: Number, default: 0 },
  },
  /* This is used to fix the “Unknown modifier: $pushAll” in mongodb >= v3.6. */
  { usePushEach: true }
);

module.exports = mongoose.model("Compendium", CompendiumSchema);
