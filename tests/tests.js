#!/usr/bin/env node
var spec = require('sugar-spec');
var mongoose = require('mongoose');

var sugar = require('../lib/mongoose-sugar');


main();

function main() {
    var address = 'mongodb://localhost/mongoose-sugar-test';

    mongoose.connect(address, function(err) {
        if(err) log('Make sure mongod is running!');
        else spec(sugar, mongoose);
    });
}
