var funkit = require('funkit');
var is = require('is-js');


module.exports = function(engine) {
    return function(parent, name) {
        return {
            fields: function(o) {
                parent[name] = init(name, invokeReferences(o, name));
            }
        };
    };

    function invokeReferences(o, name) {
        var ret = {};
        var k, v;

        for(k in o) {
            v = o[k];

            if(v.name === 'ref') {
                ret[k] = v(name);
            }
            else {
                ret[k] = v;
            }
        }

        return ret;
    }

    function init(name, o) {
        o.created = {
            type: Date,
            'default': Date.now
        };
        var meta = initMeta(o);
        o.deleted = {
            type: Boolean,
            'default': false,
            select: false
        };

        var schema = new engine.Schema(o, {
            strict: true
        });
        var ret = engine.model(name, schema);
        ret.meta = meta;

        return ret;
    }
};

function initMeta(o) {
    var ret = {};

    for(var k in o) {
        ret[k] = funkit.common.copy(o[k]);

        var v = ret[k];
        var type = v? v.type: v;

        if(is.fn(v)) {
            ret[k] = {type: v.name};
        }
        else if(is.array(v)) {
            ret[k][0] = funkit.common.copy(v[0]);
            ret[k][0].type = v[0].type && v[0].type.name;
        }
        else if(is.array(type)) {
            ret[k].type = [type[0].name];
        }
        else {
            ret[k].type = type.name;
        }
    }

    return ret;
}
