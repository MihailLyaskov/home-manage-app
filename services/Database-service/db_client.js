// @flow weak
var config = require('config');
var mysql = require('mysql');
var async = require('async');
var pool = mysql.createPool(config.database_config);

var db_client = function() {

}

db_client.prototype.registerDevice = function(args, callback) {
    pool.getConnection(function(err, connection) {
        connection.query('call register_device(?,?,?,?)', [
            args.Device,
            args.Class,
            args.ClassVer,
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
            callback(null, {
                "Device": results[0].device,
                "class": results[0].class,
                "network": results[0].network,
                "classVer": results[0].classVer
            });
            connection.release();
        });
    });
}

db_client.prototype.logData = function(args, callback) {
    pool.getConnection(function(err, connection) {
        //console.log("ARGUMEEEEEEENNNTTTSSS!")
        console.log([args.Device, args.power, args.energy]);
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

db_client.prototype.getHourlyData = function(args, callback) {
    var result = [];
    var hours = [{
        begin: '00:00:01',
        end: '01:00:00'
    }, {
        begin: '01:00:01',
        end: '02:00:00'
    }, {
        begin: '02:00:01',
        end: '03:00:00'
    }, {
        begin: '03:00:01',
        end: '04:00:00'
    }, {
        begin: '04:00:01',
        end: '05:00:00'
    }, {
        begin: '05:00:01',
        end: '06:00:00'
    }, {
        begin: '06:00:01',
        end: '07:00:00'
    }, {
        begin: '07:00:01',
        end: '08:00:00'
    }, {
        begin: '08:00:01',
        end: '09:00:00'
    }, {
        begin: '09:00:01',
        end: '10:00:00'
    }, {
        begin: '10:00:01',
        end: '11:00:00'
    }, {
        begin: '11:00:01',
        end: '12:00:00'
    }, {
        begin: '12:00:01',
        end: '13:00:00'
    }, {
        begin: '13:00:01',
        end: '14:00:00'
    }, {
        begin: '14:00:01',
        end: '15:00:00'
    }, {
        begin: '15:00:01',
        end: '16:00:00'
    }, {
        begin: '16:00:01',
        end: '17:00:00'
    }, {
        begin: '17:00:01',
        end: '18:00:00'
    }, {
        begin: '18:00:01',
        end: '19:00:00'
    }, {
        begin: '19:00:01',
        end: '20:00:00'
    }, {
        begin: '20:00:01',
        end: '21:00:00'
    }, {
        begin: '21:00:01',
        end: '22:00:00'
    }, {
        begin: '22:00:01',
        end: '23:00:00'
    }, {
        begin: '23:00:01',
        end: '23:59:59'
    }, ];
    async.eachSeries(hours, function(hour, callback) {
        //console.log(date + ' ' + hour.begin+'   '+date + ' ' + hour.end);
        pool.getConnection(function(err, connection) {
            connection.query('call get_data(?,?,?)', [
                args.Device,
                args.Date + ' ' + hour.begin,
                args.Date + ' ' + hour.end
            ], function(error, results, fields) {
                if (err) callback(error);

                var string = JSON.stringify(results[0]);
                var jsoned = JSON.parse(string);
                result.push({
                    "power": jsoned[0].power,
                    "energy": jsoned[0].energy,
                    "time": args.Date + ' ' + hour.begin
                });
                connection.release();
                callback(null)
            });
        });
    }, function(err, res) {
        if (err) callback(err);
        callback(null, result);
    });

}

module.exports = db_client;
