var mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;
var Schema = mongoose.Schema;

var ObservationSchema = new Schema({
  country: String,
  countryPart: String /* direction of compass or middle */,
  organicFarm: Boolean,
  place: String,
  count: Number,
  date: { type: Date },
  insect: { type: mongoose.Schema.Types.ObjectId, ref: "Insect" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Observation", ObservationSchema);
