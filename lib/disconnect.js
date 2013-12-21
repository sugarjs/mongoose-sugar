var mongoose = require('mongoose');


module.exports = function(cb) {
    mongoose.disconnect(cb);
};
