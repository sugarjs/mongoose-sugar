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

    console.log(sugar.getMeta(models.License));

    sugar.removeAll(models.License, logger(function() {
        sugar.getAll(models.License, {}, logger(function() {
            // TODO: should terminate (process.exit) once these are done
            sugar.create(models.License, {name: 'mit'}, logger());
            sugar.create(models.License, {name: 'mylicense'}, logger());
        }));
    }));
}

function logger(fn) {
    fn = fn || noop;

    return function(err, d) {
        if(err) return log(err);
        log(d);

        fn();
    };
}

function log(d) {
    console.log(d);
}

function noop() {}
