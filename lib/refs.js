var fp = require('annofp');
var mongoose = require('mongoose');

var ref = require('./ref');

var ObjectId = mongoose.Schema.ObjectId;


module.exports = function(name, o) {
    o = o || {};

    return [ref(name, fp.merge({
        validate: isValid
    }, o))];
};

function isValid(n) {
    return ObjectId.isValid(n);
}
