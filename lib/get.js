var is = require('annois');


module.exports = function(model, id, fields, cb) {
    var fieldsStr;

    if(is.fn(fields)) {
        cb = fields;
        fieldsStr = undefined;
    }
    if(is.array(fields)) {
        fieldsStr = fields.join(' ');
    }

    model.findById(id, fieldsStr, function(err, d) {
        if(err) {
            return cb(err);
        }

        if(is.array(fields)) {
            return cb(null, getData(model.meta, d));
        }

        cb(null, d);
    });
};

function getData(meta, d) {
    var ret = {};

    Object.keys(meta).forEach(function(v) {
        ret[v] = d[v];
    });

    return ret;
}
