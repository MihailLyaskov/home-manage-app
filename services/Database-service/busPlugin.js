//@flow weak
var Database = require('./db_client');
var async = require('async');
module.exports = function database(options) {
    var seneca = this;
    var DB = new Database();
    this.add({
        role: 'database',
        cmd: 'registerDevice'
    }, registerDevice);
    this.add({
        role: 'database',
        cmd: 'showDevices'
    }, showDevices);
    this.add({
        role: 'database',
        cmd: 'logData'
    }, logData);

    function logData(args, done) {
        DB.logData(args, function(err, res) {
            if (err) {
                console.log(err);
                done(null, {
                    result: err,
                    status: "ERROR"
                });
            }
            done(null, {
                result: 'Data written!',
                status: 'OK'
            })
        });
    }

    function showDevices(args, done) {
        DB.showDevices(function(err, res) {
            if (err) done(err);
            done(null, res);
        });
    }

    function registerDevice(args, done) {
        if (args.hasOwnProperty('deviceID') == true) {
            async.waterfall([
                async.apply(getDevice, args.deviceID),
                regDevice
            ], function(err, res) {
                if (err) {
                    console.log(err);
                    done(null, {
                        result: err,
                        status: "ERROR"
                    });
                }
                done(null, {
                    result: 'Device succesfully registered!',
                    status: 'OK'
                })
            });
        } else
            done(null, {
                result: 'missing deviceID argument!',
                status: 'ERROR'
            })
    }

    function regDevice(args, callback) {
        DB.registerDevice(args, function(err, res) {
            if (err) callback(err);
            callback(null, {
                result: res,
                status: 'OK'
            });
        });
    }

    function getDevice(deviceID, callback) {
        seneca.act({
                role: 'client',
                cmd: 'getDevice'
            }, {
                params: {
                    DeviceID: deviceID
                }
            },
            function(err, res) {
                if (res.lenght == 0) callback(null, {
                    message: 'No device found!'
                })
                else
                    callback(null, {
                        Device: res.name,
                        Class: res.deviceClass.name,
                        Ver: res.deviceClass.version,
                        Network: res.network.name
                    });
            });
    }

}
