var mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;
var Schema = mongoose.Schema;
var bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");
var uniqueValidator = require("mongoose-unique-validator");

var UserSchema = new Schema({
  githubId: String,
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
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide an email"],
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
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

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.plugin(uniqueValidator);

// create the model for users and expose it to our app
module.exports = mongoose.model("User", UserSchema);
module.exports = mongoose.model("users", UserSchema);
