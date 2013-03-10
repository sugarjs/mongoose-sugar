var funkit = require('funkit');
var is = require('is-js');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

function refs(name, o) {
    o = o || {};

    return [ref(name, funkit.common.merge({validate: isValid}, o))];
}
exports.refs = refs;

function ref(name, o) {
    o = o || {};

    return funkit.common.merge(o, {type: ObjectId, ref: name});
}
exports.ref = ref;

function isValid(n) {
    return ObjectId.isValid(n);
}

function schema(m) {
    return function(name, o) {
        o.created = {type: Date, 'default': Date.now};
        var meta = initMeta(o);
        o.deleted = {type: Boolean, 'default': false, select: false};

        var schema = new m.Schema(o, {strict: true});
        var ret = m.model(name, schema);
        ret.meta = meta;

        return ret;
    };
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
            ret[k][0].type = v[0].type.name;
        }
        else if(is.array(type)) ret[k].type = [type[0].name];
        else ret[k].type = type.name;
    }

    return ret;
}

function get(model, id, fields, cb) {
    model.findById(id, fields, cb);
}
exports.get = get;

function create(model, data, cb) {
    (new model(data)).save(cb);
}
exports.create = create;

function getAll(model, query, cb) {
    var fields = query.fields;
    var limit = query.limit;
    var skip = limit * query.offset;

    delete query.fields;
    delete query.limit;
    delete query.offset;

    model.find(query, fields, {limit: limit, skip: skip}).
        where('deleted', false).exec(cb);
}
exports.getAll = getAll;

function removeAll(model, cb) {
    model.remove().exec(cb);
}
exports.removeAll = removeAll;

function update(model, id, data, cb) {
    get(model, id, undefined, function(err, ob) {
        if(err) return cb(err);

        for(var k in data) ob[k] = data[k];

        return ob.save(cb);
    });
}
exports.update = update;

function remove(model, id, cb) {
    update(model, id, {deleted: true}, cb);
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

