#!/usr/bin/env node
var assert = require('assert');

var spec = require('sugar-spec');
var mongoose = require('mongoose');

var sugar = require('./');


main();

function main() {
    testParseAddress();

    spec({
        sugar: sugar,
        address: 'mongodb://localhost/mongoose-sugar-test',
        engine: mongoose
    });
}

function testParseAddress() {
    var simple = {
        hostname: 'demo',
        port: 1000,
        db: 'db'
    };
    var withPassword = {
        hostname: 'host',
        port: 1234,
        db: 'test',
        username: 'user',
        password: 'pw'
    };

    console.log(sugar.parseAddress(simple));
    console.log(sugar.parseAddress(withPassword));
    console.log();
}
