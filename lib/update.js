var async = require('async');
var is = require('annois');

var get = require('./get');


module.exports = function(model, id, data, cb) {
    if(is.array(id)) {
        return updateMultiple(model, id, data, cb);
    }

    updateOne(model, id, data, cb);
};

function updateMultiple(model, ids, data, cb) {
    async.map(ids, function(id, cb) {
        updateOne(model, id, data, cb);
    }, cb);
}

function updateOne(model, id, data, cb) {
    get(model, id, function(err, ob) {
        if(err) {
            return cb(err);
        }

        for(var k in data) {
            ob[k] = data[k];
        }

        return ob.save(cb);
    });
}
