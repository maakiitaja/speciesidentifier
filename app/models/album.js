var mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;
var Schema = mongoose.Schema;

var AlbumSchema = new Schema(
  {
    _user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    insects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Insect" }],
    name: { type: String, required: [true, "Please provide album name"] },
    coverImage: {
      type: String,
      required: [true, "Please provide cover image"],
    },
    shared: { type: Boolean, default: false },
  },
  /* This is used to fix the “Unknown modifier: $pushAll” in mongodb >= v3.6. */
  { usePushEach: true }
);

module.exports = mongoose.model("Album", AlbumSchema);
