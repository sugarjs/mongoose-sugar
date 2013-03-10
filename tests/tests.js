#!/usr/bin/env node
var assert = require('assert');

var async = require('async');
var mongoose = require('mongoose');
var funkit = require('funkit');
var equals = funkit.ops.equals;
var is = require('is-js');

var sugar = require('../lib/mongoose-sugar');
var models = require('./models');

var log = console.log.bind(console);

main();

function main() {
    var address = 'mongodb://localhost/mongoose-sugar-test';

    mongoose.connect(address, function(err) {
        if(err) log('Make sure mongod is running!');
    });

    log('Executing tests!');

    async.series(setup([
        createAuthor,
        updateAuthor,
        removeAuthor,
        getMeta
    ], function(t) {
        return function(cb) {
            async.series([
                removeAuthors,
                removeLibraries
            ], t.bind(undefined, cb));
        };
    }), function() {
        log('Tests executed!');

        process.exit();
    });
}

function setup(tests, fn) {
    return tests.map(function(t) {
        return fn(t);
    });
}

// TODO: figure out why bind doesn't work for these!
function removeAuthors(cb) {
    removeAll(models.Author, cb);
}

function removeLibraries(cb) {
    removeAll(models.Library, cb);
}

function createAuthor(cb) {
    var name= 'Joe';
    var extra = ['foobar', 'barbar'];
    var data = {
        name: name,
        extra: extra
    };

    sugar.create(models.Author, data, function(err, d) {
        assert.equal(d.name, name);
        assert.ok(equals(d.extra, extra));

        cb(err, d);
    });
}

function updateAuthor(cb) {
    createAuthor(function(err, d) {
        var name = d.name + d.name;

        d.name = name;

        sugar.update(models.Author, d._id, d, function(err, d) {
            assert.equal(d.name, name);

            cb(err, d);
        });
    });
}

function removeAuthor(cb) {
    createAuthor(function(err, d) {
        sugar.remove(models.Author, d._id, function(err, d) {
            assert.ok(d.deleted);

            sugar.count(models.Author, function(err, d) {
                assert.equal(d, 0);

                cb(err, d);
            });
        });
    });
}

function removeAll(model, cb) {
    sugar.removeAll(model, function(err, d) {
        cb(err, d);
    });
}

function getMeta(cb) {
    sugar.getMeta(models.Author, function(err, d) {
        assert.ok(is.object(d));

        cb(err, d);
    });
}
