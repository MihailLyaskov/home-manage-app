// @flow weak
var MongoClient = require("mongodb").MongoClient;
var collection;
var mongo = function(params, callback) {
    MongoClient.connect('mongodb://' + params.host + ':' + params.port + '/' + params.database,
        function(err, db) {
            if (err) callback(err);
            collection = db.collection(params.collection);
            callback(null, db);
        });
}

mongo.prototype.addSub = function(args, callback) {
    collection.insertOne(args, function(err, res) {
        if (err) callback(err);
        callback(null, res);
    });
}

mongo.prototype.removeSub = function(args, callback) {
    collection.deleteOne(args, function(err, res) {
        //console.log('REMOVING SUB');
        //console.log(res);
        if (err) callback(err);
        callback(null, res);
    });
}
mongo.prototype.showSubs = function(callback) {
    collection.find().toArray(function(err, docs) {
        if (err) callback(err);
        callback(null, docs)
    });
}

mongo.prototype.updateSub = function(args1, args2, callback) {
    collection.updateOne(args1, {
        $set: args2
    }, function(err, res) {
        if (err) callback(err);
        callback(null, res);
    });
}

mongo.prototype.findSub = function(args, callback) {
    collection.findOne(args, function(err, res) {
        if (err) callback(err);
        //console.log('SUB FOUND!');
        //console.log(res);
        callback(null, res);
    });
}

module.exports = mongo;
