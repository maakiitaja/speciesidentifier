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
  location: {
    // longitude, latitude
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: [Number],
  },
});

ObservationSchema.index({ country: 1 });

module.exports = mongoose.model("Observation", ObservationSchema);
