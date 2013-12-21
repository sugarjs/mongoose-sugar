var create = require('./create');
var getAll = require('./get_all');


module.exports = function(model, data, cb) {
    getAll(model, data, function(err, d) {
        if(err) {
            return cb(err);
        }

        if(d.length) {
            cb(err, d[0]);
        }
        else {
            create(model, data, cb);
        }
    });
};
