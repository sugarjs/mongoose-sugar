var mongoose = require('mongoose');


module.exports = function(address, cb) {
    mongoose.connect(address, cb);
};
