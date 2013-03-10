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
        createAuthor(),
        updateAuthor,
        removeAuthor,
        getAuthor,
        getAuthorName,
        getAllAuthors,
        getAllAuthorsLimit,
        getAllAuthorsOffset,
        getAllAuthorNames,
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

function getAuthorName(cb) {
    createAuthor()(function(err, author) {
        sugar.get(models.Author, author._id, ['name'], function(err, d) {
            assert.equal(d.name, author.name);
            assert.equal(d._id, author._id.toString()); // XXX. toString needed

            cb(err, d);
        });
    });
}

function getAuthor(cb) {
    createAuthor()(function(err, author) {
        sugar.get(models.Author, author._id, function(err, d) {
            // XXX: figure out why d._id.toString() is needed (different encoding?)
            //assert.ok(equals(author, d));
            assert.equal(author._id, d._id.toString());

            cb(err, d);
        });
    });
}

function getAllAuthors(cb) {
    // TODO: move into an array and generate createAuthors based on these
    var firstData = {name: 'Jack'};
    var secondData = {name: 'Joe'};

    async.series([
        createAuthor(firstData),
        createAuthor(secondData),
        getAll
    ], cb);

    function getAll(cb) {
        sugar.getAll(models.Author, function(err, d) {
            assert.equal(d.length, 2);

            // TODO: check just if the returned data contains (no need for order)
            assert.equal(d[0].name, firstData.name);
            assert.equal(d[1].name, secondData.name);

            cb(err, d);
        });
    }
}

// TODO: join with above somehow
function getAllAuthorNames(cb) {
    var firstData = {name: 'Jack', extra: ['foo', 'bar']};
    var secondData = {name: 'Joe', extra: ['boo', 'moo']};

    async.series([
        createAuthor(firstData),
        createAuthor(secondData),
        getAll
    ], cb);

    function getAll(cb) {
        sugar.getAll(models.Author, {fields: ['name']}, function(err, d) {
            assert.equal(d.length, 2);

            // TODO: no need for these to be in order
            assert.equal(d[0].name, firstData.name);
            assert.equal(d[0].extra, undefined);
            assert.equal(d[1].name, secondData.name);
            assert.equal(d[1].extra, undefined);

            cb(err, d);
        });
    }
}

// TODO: join with above somehow
function getAllAuthorsLimit(cb) {
    var firstData = {name: 'Jack', extra: ['foo', 'bar']};
    var secondData = {name: 'Joe', extra: ['boo', 'moo']};

    async.series([
        createAuthor(firstData),
        createAuthor(secondData),
        getAll
    ], cb);

    function getAll(cb) {
        sugar.getAll(models.Author, {limit: 1}, function(err, d) {
            assert.equal(d.length, 1);

            // TODO: no need for these to be in order
            assert.equal(d[0].name, firstData.name);
            assert.ok(equals(d[0].extra, firstData.extra));

            cb(err, d);
        });
    }
}

// TODO: join with above somehow
function getAllAuthorsOffset(cb) {
    var firstData = {name: 'Jack', extra: ['foo', 'bar']};
    var secondData = {name: 'Joe', extra: ['boo', 'moo']};

    async.series([
        createAuthor(firstData),
        createAuthor(secondData),
        getAll
    ], cb);

    function getAll(cb) {
        sugar.getAll(models.Author, {limit: 1, offset: 1}, function(err, d) {
            assert.equal(d.length, 1);

            // TODO: no need for these to be in order
            assert.equal(d[0].name, secondData.name);
            assert.ok(equals(d[0].extra, secondData.extra));

            cb(err, d);
        });
    }
}

function updateAuthor(cb) {
    createAuthor()(function(err, d) {
        var name = d.name + d.name;

        d.name = name;

        sugar.update(models.Author, d._id, d, function(err, d) {
            assert.equal(d.name, name);

            cb(err, d);
        });
    });
}

function removeAuthor(cb) {
    createAuthor()(function(err, d) {
        sugar.remove(models.Author, d._id, function(err, d) {
            assert.ok(d.deleted);

            sugar.count(models.Author, function(err, d) {
                assert.equal(d, 0);

                cb(err, d);
            });
        });
    });
}

// XXX: using factory here since bind does not seem to work with async
function createAuthor(data) {
    var name, extra; // TODO: tidy up
    if(data) {
        name = data.name;
        extra = data.extra;
    }
    else {
        name = 'Joe';
        extra = ['foobar', 'barbar'];
        data = {
            name: name,
            extra: extra
        };
    }

    return function(cb) {
        sugar.create(models.Author, data, function(err, d) {
            assert.equal(d.name, name);
            assert.ok(equals(d.extra, extra));

            cb(err, d);
        });
    };
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
