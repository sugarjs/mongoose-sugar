var funkit = require('funkit');
var is = require('is-js');
var mongoose = require('mongoose');
var async = require('async');

var ObjectId = mongoose.Schema.ObjectId;


function parseAddress(obj) {
    if(obj.username && obj.password) {
        return 'mongodb://' + obj.username + ':' + obj.password + '@' +
            obj.hostname + ':' + obj.port + '/' + obj.db;
    }
    else{
        return 'mongodb://' + obj.hostname + ':' + obj.port + '/' + obj.db;
    }
}
exports.parseAddress = parseAddress;

function connect(address, cb) {
    mongoose.connect(address, cb);
}
exports.connect = connect;

function disconnect(cb) {
    mongoose.disconnect(cb);
}
exports.disconnect = disconnect;

function mixed() {
    return mongoose.Schema.Types.Mixed;
}
exports.mixed = mixed;

function refs(name, o) {
    o = o || {};

    return [ref(name, funkit.common.merge({validate: isValid}, o))];
}
exports.refs = refs;

function ref(name, o) {
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
                remove(model, params, function(err, d) {
                    next();
                });
            }
            else next();
        });

        return funkit.common.merge(o, {type: ObjectId, ref: name});
    };
}
exports.ref = ref;

function isValid(n) {
    return ObjectId.isValid(n);
}

function schema(engine) {
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

            if(v.name == 'ref') ret[k] = v(name);
            else ret[k] = v;
        }

        return ret;
    }

    function init(name, o) {
        o.created = {type: Date, 'default': Date.now};
        var meta = initMeta(o);
        o.deleted = {type: Boolean, 'default': false, select: false};

        var schema = new engine.Schema(o, {strict: true});
        var ret = engine.model(name, schema);
        ret.meta = meta;

        return ret;
    }
}
exports.schema = schema;

function initMeta(o) {
    var ret = {};

    for(var k in o) {
        ret[k] = funkit.common.copy(o[k]);

        var v = ret[k];
        var type = v? v.type: v;

        if(is.fn(v)) ret[k] = {type: v.name};
        else if(is.array(v)) {
            ret[k][0] = funkit.common.copy(v[0]);
            ret[k][0].type = v[0].type && v[0].type.name;
        }
        else if(is.array(type)) ret[k].type = [type[0].name];
        else ret[k].type = type.name;
    }

    return ret;
}

function get(model, id, fields, cb) {
    if(is.fn(fields)) {
        cb = fields;
        fields = undefined;
    }
    if(is.array(fields)) fields = fields.join(' ');

    model.findById(id, fields, cb);
}
exports.get = get;

function getOrCreate(model, data, cb) {
    getAll(model, data, function(err, d) {
        if(err) return cb(err);

        if(d.length) cb(err, d[0]);
        else create(model, data, cb);
    });
}
exports.getOrCreate = getOrCreate;

function create(model, data, cb) {
    if(is.array(data)) return createMultiple(model, data, cb);

    createOne(model, data, function(err, d) {
        cb(err, d);
    });
}
function createMultiple(model, data, cb) {
    async.map(data, createOne.bind(null, model), cb);
}
function createOne(model, data, cb) {
    (new model(data)).save(cb);
}
exports.create = create;

function getOne(model, query, cb) {
    getAll(model, query, function(err, d) {
        cb(err, d && d[0]);
    });
}
exports.getOne = getOne;

function getAll(model, query, cb) {
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
}
exports.getAll = getAll;

function removeAll(model, cb) {
    model.remove().exec(cb);
}
exports.removeAll = removeAll;

function update(model, id, data, cb) {
    if(is.array(id)) return updateMultiple(model, id, data, cb);

    updateOne(model, id, data, cb);
}
function updateMultiple(model, ids, data, cb) {
    async.map(ids, function(id, cb) {
        updateOne(model, id, data, cb);
    }, cb);
}
function updateOne(model, id, data, cb) {
    get(model, id, function(err, ob) {
        if(err) return cb(err);

        for(var k in data) ob[k] = data[k];

        return ob.save(cb);
    });
}
exports.update = update;

function remove(model, fields, cb) {
    if(is.string(fields)) return update(model, fields, {deleted: true}, function(err, d) {
        cb(err, d);
    });

    getAll(model, fields, function(err, data) {
        if(err) return cb(err);

        async.map(data, function(d, cb) {
            update(model, d._id, {deleted: true}, cb);
        }, function(err, d) {
            cb(err, d);
        });
    });
}
exports.remove = remove;

function count(model, cb) {
    model.count({}).where('deleted', false).exec(cb);
}
exports.count = count;

function getMeta(model, cb) {
    cb(null, model.meta);
}
exports.getMeta = getMeta;

