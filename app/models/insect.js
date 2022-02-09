var mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;
var Schema = mongoose.Schema;

var TranslationSchema = new Schema({
  language: String,
  name: String,
});

var InsectSchema = new Schema(
  {
    translations: [TranslationSchema],
    latinName: { type: String, required: true },
    wiki: String,
    primaryColor: { type: String, required: true },
    secondaryColor: { type: String, required: true },
    legs: Number,
    category: { type: String, required: true },
    images: [String],
    imageLinks: [String],
    userId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

InsectSchema.index({ primaryColor: 1 });
InsectSchema.index({ category: 1 });
InsectSchema.index({ secondaryColor: 1 });
module.exports = mongoose.model("Insect", InsectSchema);

//module.exports = mongoose.model("insects", InsectSchema);
//module.exports = mongoose.model('translations', TranslationSchema);
