var is = require('is-js');


module.exports = function(model, query, cb) {
    var fields;

    if(query.fields) {
        fields = is.array(query.fields)? query.fields.join(' '): query.fields;
    }

    var limit = query.limit;
    var skip = limit * query.offset;

    delete query.fields;
    delete query.limit;
    delete query.offset;

    model.find(query, fields).limit(limit).skip(skip).where('deleted', false).exec(cb);
};
