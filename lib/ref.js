var funkit = require('funkit');
var mongoose = require('mongoose');

var remove = require('./remove');

var ObjectId = mongoose.Schema.ObjectId;


module.exports = function(name, o) {
    o = o || {};

    // this function will be invoked by the schema initializer
    return function ref(parent) {
        var field = name.toLowerCase(); // assumes name maps to field
        var model, params;

        if(!(name in mongoose.models)) {
            return console.warn('Target schema not found! Make sure the schema you refer to has been declared already!');
        }

        mongoose.models[name].schema.pre('save', function(next) {
            model = mongoose.models[parent];

            if(this.deleted && model) {
                params = {};
                params[field] = this._id;
                remove(model, params, function() {
                    next();
                });
            }
            else {
                next();
            }
        });

        return funkit.common.merge(o, {type: ObjectId, ref: name});
    };
};
