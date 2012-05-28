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

function schema(name, o) {
    o.created = {type: Date, 'default': Date.now};
    var meta = initMeta(o);
    o.deleted = {type: Boolean, 'default': false, select: false};

    var ret = mongoose.model(name, new mongoose.Schema(o, {strict: true}));
    ret.meta = meta;
    return ret;
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

function get(model, id, fields, okCb, errCb) {
    model.findById(id, fields, function(err, data) {
        if(err) return errCb(err);

        okCb(data);
    });
}
exports.get = get;

function create(model, data, okCb, errCb) {
    var ob = new model(data);

    ob.save(function(err, d) {
        if(err) errCb(err);
        else okCb(d);
    });
}
exports.create = create;

function getAll(model, query, okCb, errCb) {
    var fields = query.fields;
    var limit = query.limit;
    var skip = limit * query.offset;

    delete query.fields;
    delete query.limit;
    delete query.offset;

    model.find(query, fields, {limit: limit, skip: skip}).
        where('deleted', false).
        run(function(err, data) {
            if(err) errCb(err);
            else okCb(data);
        }
    );
}
exports.getAll = getAll;

function update(model, id, data, okCb, errCb) {
    get(model, id, undefined, function(ob) {
        for(var k in data) {
            ob[k] = data[k];
        }

        return ob.save(function(err) {
            if(err) errCb(err);
            else okCb(ob);
        });
    }, errCb);
}
exports.update = update;

function del(model, id, okCb, errCb) {
    update(model, id, {deleted: true}, function() {okCb({});}, errCb);
}
exports['delete'] = del;

function count(model, okCb, errCb) {
    model.count({}, function(err, count) {
        if(err) errCb(err);
        else okCb(count);
    });
}
exports.count = count;

function getMeta(model) {
    return model.meta;
}
exports.getMeta = getMeta;

