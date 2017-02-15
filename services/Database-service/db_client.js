// @flow weak
var config = require('config');
var mysql = require('mysql');
var pool = mysql.createPool(config.database_config);

var db_client = function() {

}

db_client.prototype.registerDevice = function(args, callback) {
    pool.getConnection(function(err, connection) {
        connection.query('call register_device(?,?,?,?)', [
            args.Device,
            args.Class,
            args.Ver,
            args.Network
        ], function(error, results, fields) {
            if (err) callback(error);
            if (results == null)
                callback('Device already registered!')
            else
                callback(null, results);
            connection.release();
        });
    });
}

db_client.prototype.showDevices = function(callback) {
    pool.getConnection(function(err, connection) {
        if (err) console.log(err);
        connection.query('call show_devices()', function(error, results, fields) {
            if (err) throw err(error);
            callback(null, results[0]);
            connection.release();
        });
    });
}

db_client.prototype.logData = function(args, callback) {
    pool.getConnection(function(err, connection) {
        if (err) console.log(err);
        connection.query('call log_data(?,?,?)', [args.Device, args.power, args.energy], function(error, results, fields) {
            if (results != null)
                callback(null, results);
            else {
                callback('Data not writen!');
            }
            connection.release();
        });
    });
}

module.exports = db_client;
