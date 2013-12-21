var async = require('async');
var is = require('annois');

var getAll = require('./get_all');
var update = require('./update');


module.exports = function(model, fields, cb) {
    if(is.string(fields)) {
        return update(model, fields, {deleted: true}, function(err, d) {
            cb(err, d);
        });
    }

    getAll(model, fields, function(err, data) {
        if(err) {
            return cb(err);
        }

        async.map(data, function(d, cb) {
            update(model, d._id, {deleted: true}, cb);
        }, function(err, d) {
            cb(err, d);
        });
    });
};
