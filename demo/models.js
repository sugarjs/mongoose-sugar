var mongoose = require('mongoose');
var sugar = require('../lib/mongoose-sugar');

var schema = sugar.schema(mongoose);
var ref = sugar.ref;
var refs = sugar.refs;
var unique = sugar.unique;

exports.Author = schema('Author', {
    name: {type: String, required: true}
});

exports.License = schema('License', {
    name: {type: String, unique: true}
});

exports.Library = schema('Library', {
    author: ref('Author', {required: true}),
    name: {type: String, required: true},
    licenses: refs('License')
});

