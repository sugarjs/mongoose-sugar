#!/usr/bin/env node
var mongoose = require('mongoose');
var sugar = require('../lib/mongoose-sugar');
var models = require('./models');

log('Make sure mongod is running!');

// TODO: expand this (figure out how to test properly)
var address = 'mongodb://localhost/mongoose-sugar';

main();

function main() {
    mongoose.connect(address);

    sugar.getMeta(models.Author, logger());

    sugar.removeAll(models.Author, logger(function() {
        sugar.create(models.Author, {
                name: 'Joe',
                extra: ['foobar', 'barbar']
            }, logger(function(author) {
            sugar.update(models.Author, author._id, {extra: ['stuff']}, logger(function() {
                sugar.removeAll(models.Library, logger(function() {
                    sugar.create(models.Library, {
                        author: author._id,
                        name: 'demo library'
                    }, logger());
                }));
            }));
        }));
    }));

    sugar.getMeta(models.License, logger());

    sugar.removeAll(models.License, logger(function() {
        // TODO: should terminate (process.exit) once these are done
        sugar.create(models.License, {name: 'mit'}, logger());
        sugar.create(models.License, {name: 'mylicense'}, logger());
    }));
}

function logger(fn) {
    fn = fn || noop;

    return function(err, d) {
        if(err) return log(err);
        log(d);

        fn(d);
    };
}

function log(d) {
    console.log(d);
}

function noop() {}
