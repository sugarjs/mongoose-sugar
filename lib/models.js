var mongoose = require('mongoose');
var sugar = require('./mongoose-sugar');

var schema = sugar.schema(mongoose);
var refs = sugar.refs;

exports.License = schema('License', {
    name: String
});

exports.Library = schema('Library', {
    name: {type: String, required: true},
    licenses: refs('License')
});

