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
            async.eachSeries(config.device_config.sub_for_comands, subscribeForCommands, function(err, res) {
                if (err) console.log(err)
            });

        });
});

function subscribeForCommands(command, callback) {
    var subcmd = hive.device.subscribe(function(err, res) {
        if (err) callback(err, null);
        console.log('DEVICE SUBSCRIBES TO MASAGES ' + JSON.stringify(res));
        callback(null, res);
    }, {
        names: [command.hive]
    });
    subcmd.message(function(cmd) {
        if (cmd.command == command.hive)
            seneca.act(command.seneca_service, cmd.parameters, function(err, result) {
                if (err) cmd.update({
                    "command": command.hive,
                    "status": "ERROR",
                    "result": {
                        "data": err
                    }
                });
                cmd.update({
                    "command": command.hive,
                    "status": result.status,
                    "result": result.result
                });
            })
    });
}

function createClients(client, callback) {
    seneca.client(client);
    callback();
}
