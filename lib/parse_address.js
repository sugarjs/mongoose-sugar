module.exports = function(obj) {
    if(obj.username && obj.password) {
        return 'mongodb://' + obj.username + ':' + obj.password + '@' +
            obj.hostname + ':' + obj.port + '/' + obj.db;
    }
    else{
        return 'mongodb://' + obj.hostname + ':' + obj.port + '/' + obj.db;
    }
};
