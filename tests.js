#!/usr/bin/env node
var spec = require('sugar-spec');
var mongoose = require('mongoose');

var sugar = require('./lib/mongoose-sugar');


main();

function main() {
    spec({
        sugar: sugar,
        address: 'mongodb://localhost/mongoose-sugar-test',
        engine: mongoose
    });
}
