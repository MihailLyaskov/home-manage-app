// @flow weak

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    port: 15000,
    user: 'logger',
    password: '142536',
    database: 'devicelog'
});

var db_client = function() {

}

db_client.prototype.registerDevice = function(args, callback) {
    pool.getConnection(function(err, connection) {
        // connected! (unless `err` is set)
        if (err) console.log(err);
        connection.query('call register_device(?,?,?,?)', [
            args.Device,
            args.Class,
            args.Ver,
            args.Network
        ], function(error, results, fields) {
            if (err) throw err(error);
            callback(null, results);
            connection.release();
        });
    });
}

db_client.prototype.showDevices = function(callback) {
    pool.getConnection(function(err, connection) {
        // connected! (unless `err` is set)
        if (err) console.log(err);
        connection.query('call show_devices()', function(error, results, fields) {
            if (err) throw err(error);
            callback(null, results);
            connection.release();
        });
    });
}

module.exports = db_client;
