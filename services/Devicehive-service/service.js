/*
Description:
  This file is a wrapper for DeviceHive client and device connector logic.
*/

const config = require('config'); // Get configuration file
const async = require('async');
var hive = null;
var seneca = require('seneca')(); // Create seneca bus connection

/*
Here we initialize the device/client object which register the app as a device
and opens channels for device and client connections. As e result we are given
"HiveConnections" object which we use to:
  1) Create client connections to the other service on seneca bus by using the config file.
  2) Subscribe the connector device for the according commands used by the other services
      and direct them to the corresponding seneca bus patterns using again config file.
*/
var Device = require('./device.js')(function(err, HiveConnections) {
    hive = HiveConnections;
    seneca.use('./busPlugin', HiveConnections)
        .ready(function(err) {
            if (err) console.log(err)
            seneca.listen();
            async.each(config.device_config.seneca_clients, createClients, function(err, res) {
                if (err) console.log(err)
            });
            async.each(config.device_config.sub_for_comands, subscribeForCommands, function(err, res) {
                if (err) console.log(err)
            });
            async.each(config.device_config.native_commands, subscribeForNative, function(err, res) {
                if (err) console.log(err)
            });
        });
});

function subscribeForNative(command, callback) {
    var subcmd = hive.device.subscribe(function(err, res) {
        if (err) callback(err, null);
        console.log('DEVICE SUBSCRIBES TO MASAGES ' + JSON.stringify(res));
        callback(null, res);
    }, {
        names: [command.hive]
    });
    subcmd.message(function(cmd) {
        if (cmd.command == command.hive) {
            //console.log("DATABASE SUBSCRIBEEE! \n" + JSON.stringify(cmd));
            if (cmd.parameters.hasOwnProperty('deviceID') == true && cmd.parameters.hasOwnProperty('notification') == true) {
                //console.log("properties are present!")
                makeClientSub(cmd, command, function(err, res) {
                    if (err) cmd.update(err);
                    cmd.update({
                        "command": command.hive,
                        "status": "Ok",
                        "result": "Subscribe Done!"
                    });
                })
            } else {
                cmd.update({
                    "command": command.hive,
                    "status": "ERROR",
                    "result": "Missing deviceID or notification argument!"
                })
            }
        }
    });
}

function makeClientSub(cmd, commandCfg, callback) {
    //console.log("MAKE CLIENT SUB")
    hive.client.subscribe(
        function(err, subscription) {
            if (err)
                callback({
                    "command": command.hive,
                    "status": "ERROR",
                    "result": "Can't subscribe for device!"
                })

            //console.log("SUBSCRIBE DONE")
            subscription.message(function(deviceIds, options) {
                seneca.act(commandCfg.seneca_service, {
                    Device: cmd.parameters.deviceID,
                    power: options.parameters.power,
                    energy: options.parameters.energy
                }, function(err, res) {
                    if (err) console.log(err);
                    callback(null);
                });
            });

        }, {
            subscription: {
                deviceIds: cmd.parameters.deviceID,
                names: cmd.parameters.notification,
                onMessage: cmd.parameters.notification
            }
        }
    );
}

function subscribeForCommands(command, callback) {
    var subcmd = hive.device.subscribe(function(err, res) {
        if (err) callback(err, null);
        console.log('DEVICE SUBSCRIBES TO MASAGES ' + JSON.stringify(res));
        callback(null, res);
    }, {
        names: [command.hive]
    });
    subcmd.message(function(cmd) {
        if (cmd.command == command.hive) {
            //console.log('COMMAND IN CONNECTOR! \n ' + cmd)
            seneca.act(command.seneca_service, cmd.parameters, function(err, result) {
                //console.log('RESULT! \n ' + result);
                if (err) cmd.update({
                    "command": command.hive,
                    "status": "ERROR",
                    "result": {
                        "data": err
                    }
                });
                cmd.update({
                    "command": command.hive,
                    "status": "OK",
                    "result": result
                });
            })
        }
    });
}

function createClients(client, callback) {
    seneca.client(client);
    callback();
}
