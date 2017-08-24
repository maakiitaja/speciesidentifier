var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var ObservationDetailSchema = new Schema({
	count: Number,
	date: {type: Date},
	insect: {type: mongoose.Schema.Types.ObjectId, ref: 'Insect'}	
});

module.exports = mongoose.model('ObservationDetail', ObservationDetailSchema);
