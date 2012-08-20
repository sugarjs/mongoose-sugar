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
    sugar.getAll(models.License, {}, function(err, d) {
        if(err) return log(err);
        log(d);

        sugar.create(models.License, {name: 'mit'}, function(err, d) {
            if(err) return log(err);
            log(d);
            process.exit();
        });

        sugar.create(models.License, {name: 'mylicense'}, function(err, d) {
        if(err) return log(err);
            log(d);
            process.exit();
        });
    });
}

function log(d) {
    console.log(d);
}

