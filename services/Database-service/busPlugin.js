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


    function registerDevice(args, done) {
        if (args.hasOwnProperty('deviceID') == true) {
            async.waterfall([
                async.apply(getDevice, args.deviceID),
                regDevice
            ], function(err, res) {
                if (err) {
                    console.log(err);
                    done(null, {
                        asnwer: 'No device found!'
                    });
                }
                done(null, {
                    answer: 'Device succesfully registered!'
                })
            });
        } else
            done(null, {
                answer: 'missing deviceID argument!'
            })
    }

    function regDevice(args, callback) {
        DB.registerDevice(args, function(err, res) {
            if (err) callback(err);
            callback(null, res);
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
                if (err) callback(err)
                callback(null, {
                    Device: res.name,
                    Class: res.deviceClass.name,
                    Ver: res.deviceClass.version,
                    Network: res.network.name
                });
            });
    }

}
