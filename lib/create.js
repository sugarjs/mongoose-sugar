var async = require('async');
var is = require('annois');


module.exports = function(model, data, cb) {
    if(is.array(data)) {
        return createMultiple(model, data, cb);
    }

    createOne(model, data, function(err, d) {
        cb(err, d);
    });
};

function createMultiple(model, data, cb) {
    async.map(data, createOne.bind(null, model), cb);
}

function createOne(Model, data, cb) {
    (new Model(data)).save(cb);
}
