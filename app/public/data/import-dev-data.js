const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var Insect = require("./../../models/insect");
const User = require("./../../models/user");
const Observation = require("./../../models/observation");
const Album = require("./../../models/album");
const Collection = require("./../../models/compendium");
dotenv.config({ path: "./../../../bin/.env" });
console.log("database:", process.env.DATABASE);
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log("DB connection successful!"));

const insects = JSON.parse(
  fs.readFileSync(`${__dirname}/insects.json`, "utf-8")
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Insect.create(insects);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Insect.deleteMany();
    await Collection.deleteMany();
    await Album.deleteMany();
    await Observation.deleteMany();
    await User.deleteMany();

    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
