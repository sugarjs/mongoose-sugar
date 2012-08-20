var mongoose = require('mongoose');
var sugar = require('../lib/mongoose-sugar');

var schema = sugar.schema(mongoose);
var refs = sugar.refs;
var unique = sugar.unique;

exports.License = schema('License', {
    name: {type: String, unique: true}
});

exports.Library = schema('Library', {
    name: {type: String, required: true},
    licenses: refs('License')
});

