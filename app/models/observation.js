var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var ObservationSchema = new Schema({
	country: String,
	county: String,
	location: String, /* point of compass or middle */
	farm: Boolean,
	organicFarm: Boolean,
	place: String,	
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	detail: [{type: mongoose.Schema.Types.ObjectId, ref: 'ObservationDetail'}]
});
  
module.exports = mongoose.model('Observation', ObservationSchema);
