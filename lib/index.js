var changeTo = require('change-case');

module.exports = init();

function init() {
    var modules = require('require-dir')('.');
    var ret = {};

    Object.keys(modules).forEach(function(name) {
        ret[changeTo.camelCase(name)] = modules[name];
    });

    return ret;
}
