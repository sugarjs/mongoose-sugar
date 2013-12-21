module.exports = function(model, cb) {
    model.remove().exec(cb);
};
