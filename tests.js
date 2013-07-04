#!/usr/bin/env node
var spec = require('sugar-spec');
var mongoose = require('mongoose');

var sugar = require('./lib/mongoose-sugar');


main();

function main() {
    var address = 'mongodb://localhost/mongoose-sugar-test';

    spec(sugar, address, mongoose);
}
