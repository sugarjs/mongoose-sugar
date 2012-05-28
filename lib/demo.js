#!/usr/bin/env node
var mongoose = require('mongoose');
var sugar = require('./mongoose-sugar');
var models = require('./models');

log('Make sure mongod is running!');

// TODO: expand this (figure out how to test properly)
mongoose.connect('mongodb://localhost/mongoose-sugar');

sugar.getAll(models.License, {}, function(d) {
    log(d);

    sugar.create(models.License, {name: 'mit'}, function(d) {
        log(d);
        process.exit();
    });
});

function log(d) {
    console.log(d);
}

