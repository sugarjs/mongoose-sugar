module.exports = function(model, cb) {
    model.count({}).where('deleted', false).exec(cb);
};
