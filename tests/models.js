var mongoose = require('mongoose');
var sugar = require('../lib/mongoose-sugar');

var schema = sugar.schema(mongoose);
var ref = sugar.ref;
var refs = sugar.refs;
var unique = sugar.unique;

exports.Author = schema('Author', {
    name: {type: String, required: true},
    nick: String,
    extra: mongoose.Schema.Types.Mixed
});

exports.License = schema('License', {
    name: {type: String, unique: true}
});

exports.Library = schema('Library', {
    author: ref('Author', {required: true}),
    name: {type: String, required: true},
    licenses: refs('License')
});

// this a bit contrived example illustrates how to use
// schemas as sort of templates. this schema is needed
// for testing delete cascade as well
exports.LibraryAuthor = schema('LicenseAuthor', {
    library: ref('Library', {required: true}),
    author: ref('Author', {required: true}),
    role: String
});
