var fp = require('annofp');
var is = require('annois');


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
                if(v.unique) {
                    v.sparse = true;
                }

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
        ret[k] = fp.copy(o[k]);

        var v = ret[k];
        var type = v? v.type: v;

        if(is.fn(v)) {
            ret[k] = {type: v.name};
        }
        else if(is.array(v)) {
            ret[k][0] = fp.copy(v[0]);
            ret[k][0].type = v[0].type && v[0].type.name;
        }
        else if(is.array(type)) {
            ret[k].type = [type[0].name];
        }
        else if(!type && is.object(v)) {
            ret[k].type = 'Object';
        }
        else {
            ret[k].type = type.name;
        }

        delete ret[k].sparse;
        delete ret[k].default;
    }

    return ret;
}
