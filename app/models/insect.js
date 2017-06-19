																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																var mongoose = require('mongoose')
var ObjectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var TranslationSchema = new Schema({
	language: String,
	name: String
});

var InsectSchema = new Schema({
	translations: [TranslationSchema],
	names:[{language: String, name: String}],
	latinName:String,
	wiki: String,
	territory: [String],
	primaryColor: String,
	secondaryColor: String,
	legs: Number,
	category: String,
	images: [String],
	imageLinks: [String],
	userId: [String]
});

//module.exports = mongoose.model('Insect', InsectSchema);

module.exports = mongoose.model('insects', InsectSchema);	
//module.exports = mongoose.model('translations', TranslationSchema);	

