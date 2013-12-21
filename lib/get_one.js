var getAll = require('./get_all');


module.exports = function(model, query, cb) {
    getAll(model, query, function(err, d) {
        cb(err, d && d[0]);
    });
};
