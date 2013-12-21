var is = require('is-js');


module.exports = function(model, id, fields, cb) {
    if(is.fn(fields)) {
        cb = fields;
        fields = undefined;
    }
    if(is.array(fields)) {
        fields = fields.join(' ');
    }

    model.findById(id, fields, cb);
};
