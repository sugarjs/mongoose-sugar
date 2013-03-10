#!/usr/bin/env node
var mongoose = require('mongoose');

var sugar = require('../lib/mongoose-sugar');
var models = require('./models');
var spec = require('./spec');


main();

function main() {
    var address = 'mongodb://localhost/mongoose-sugar-test';

    mongoose.connect(address, function(err) {
        if(err) log('Make sure mongod is running!');
        else spec(sugar, models);
    });
}
