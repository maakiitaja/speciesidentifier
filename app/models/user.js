var mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;
var Schema = mongoose.Schema;
var bcrypt = require("bcryptjs");
const validator = require("validator");
var uniqueValidator = require("mongoose-unique-validator");

var UserSchema = new Schema({
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String,
  },
  twitter: {
    id: String,
    token: String,
    displayName: String,
    username: String,
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String,
  },
  username: {
    type: String,
    unique: true,
    required: [true, "Please provide a username"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 4,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide an email"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phone: Number,
  _enabled: Boolean,
  compendium: { type: mongoose.Schema.Types.ObjectId, ref: "Compendium" },
});

// methods ======================
// generating a hash
UserSchema.methods.createHash = async function () {
  return await bcrypt.hash(this.password, 10);
};

// // checking if password is valid
UserSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.plugin(uniqueValidator);

// create the model for users and expose it to our app
module.exports = mongoose.model("User", UserSchema);
module.exports = mongoose.model("users", UserSchema);
