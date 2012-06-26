var funkit = require('funkit');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

function refs(name) {
    return [{type: ObjectId, ref: name, validate: isValid}];
}
exports.refs = refs;

function isValid(n) {
    return ObjectId.isValid(n);
}

function schema(m) {
    return function(name, o) {
        o.created = {type: Date, 'default': Date.now};
        var meta = initMeta(o);
        o.deleted = {type: Boolean, 'default': false, select: false};

        var ret = m.model(name, new m.Schema(o, {strict: true}));
        ret.meta = meta;
        return ret;
    };
}
exports.schema = schema;

function initMeta(o) {
    var ret = {};

    for(var k in o) {
        ret[k] = funkit.copy(o[k]);

        var v = ret[k];
        var type = v? v.type: v;
        if(funkit.isFunction(v)) ret[k] = {type: v.name};
        else if(funkit.isArray(v)) {
            ret[k][0] = funkit.copy(v[0]);
            ret[k][0].type = v[0].type.name;
        }
        else if(funkit.isArray(type)) ret[k].type = [type[0].name];
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
        where('deleted', false).run(cb);
}
exports.getAll = getAll;

function update(model, id, data, cb) {
    get(model, id, undefined, function(err, ob) {
        if(err) return cb(err);

        for(var k in data) ob[k] = data[k];

        return ob.save(cb);
    });
}
exports.update = update;

function del(model, id, cb) {
    update(model, id, {deleted: true}, cb);
}
exports['delete'] = del;

function count(model, cb) {
    model.count({}, cb);
}
exports.count = count;

function getMeta(model) {
    return model.meta;
}
exports.getMeta = getMeta;

