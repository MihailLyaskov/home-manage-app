// @flow weak
/*
Description:
  This file is a wrapper for DeviceHive client and device connector logic.
*/

const config = require('config'); // Get configuration file
const async = require('async');
const mongo = require('./lib/mongo');
var hive = null;
var seneca = require('seneca')(); // Create seneca bus connection
var mongodb = new mongo(config.device_config.mongo, function(err, res) {
    if (err) console.log(err);
    //console.log('MONGO STARTED')
});
/*
Here we initialize the device/client object which register the app as a device
and opens channels for device and client connections. As e result we are given
"HiveConnections" object which we use to:
  1) Create client connections to the other service on seneca bus by using the config file.
  2) Subscribe the connector device for the according commands used by the other services
      and direct them to the corresponding seneca bus patterns using again config file.
  3) Subscribe the connector device for native commands for managing subscriptions dedicated to
      other services.
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
            subscribeForNative(['connector/subscribe', 'connector/unsubscribe', 'connector/showSubs'], function(err, res) {
                if (err) console.log(err);
                //console.log(res);
            });
            initialNotificationSub(function(err, res) {
                if (err) console.log(err);
                console.log(res);
            });
        });
});

function subscribeAndUpdate(args, callback) {
    hive.client.subscribe(
        function(err, subscription) {
            if (err) callback(err);
            //console.log(subscription);
            mongodb.updateSub({
                Device: args.Device,
                notification: args.notification,
                subID: args.subID,
                subService: args.subService
            }, {
                subID: subscription.id
            }, function(err, res) {
                if (err) callback(err);
            })
            //console.log("SUBSCRIBE DONE")
            subscription.message(function(deviceIds, options) {
                //console.log(options)
                async.each(config.device_config.services_and_sub_paths,
                    function(service, callback) {
                        if (service.service == args.subService) {
                            options.parameters.Device = deviceIds;
                            //console.log(options);
                            seneca.act(service.sub_path, options.parameters, function(err, res) {
                                if (err) callback(err);
                                callback(null);
                            });
                        } else {
                            callback(null);
                        }
                    },
                    function(err, res) {
                        if (err) console.log(err);
                    });
            });
            callback(null);

        }, {
            subscription: {
                deviceIds: args.Device,
                names: args.notification,
                onMessage: args.notification
            }
        }
    );
}

function initialNotificationSub(callback) {
    mongodb.showSubs(function(err, res) {
        if (err) console.error(err)
        else if (res.length == 0)
            callback(null, 'Subscription database is empty! :)');
        else {
            async.each(res, subscribeAndUpdate, function(err, res) {
                if (err) console.log(err);
            })
        }
    });
}

function subscribeForNative(commands, callback) {
    var subcmd = hive.device.subscribe(function(err, res) {
        if (err) callback(err, null);
        console.log('DEVICE SUBSCRIBES TO MASAGES ' + JSON.stringify(res));
        callback(null, res);
    }, {
        names: commands
    });
    subcmd.message(function(cmd) {
        if (cmd.command == 'connector/subscribe') {
            //console.log("DATABASE SUBSCRIBEEE! \n" + JSON.stringify(cmd));
            if (cmd.parameters.hasOwnProperty('Device') == true &&
                cmd.parameters.hasOwnProperty('notification') == true &&
                cmd.parameters.hasOwnProperty('service') == true) {
                //console.log("properties are present!")
                addClientSub(cmd, function(err, res) {
                    if (err) cmd.update(err);
                    cmd.update({
                        "command": 'connector/subscribe',
                        "status": "OK",
                        "result": "Subscribe Done!"
                    });
                })
            } else {
                cmd.update({
                    "command": 'connector/subscribe',
                    "status": "ERROR",
                    "result": "Missing Device , notification or service argument!"
                })
            }
        } else if (cmd.command == 'connector/showSubs') {
            mongodb.showSubs(function(err, res) {
                if (err)
                    cmd.update({
                        "command": 'connector/showSubs',
                        "status": "Error",
                        "result": "Error!"
                    });
                else {
                    cmd.update({
                        "command": 'connector/showSubs',
                        "status": "OK",
                        "result": res
                    });
                }
            });
        } else {
            //console.log("DATABASE SUBSCRIBEEE! \n" + JSON.stringify(cmd));
            if (cmd.parameters.hasOwnProperty('Device') == true &&
                cmd.parameters.hasOwnProperty('service') == true) {
                //console.log("properties are present!")
                removeClientSub(cmd, function(err, res) {
                    if (err) cmd.update(err);
                    cmd.update({
                        "command": 'connector/unsubscribe',
                        "status": "OK",
                        "result": "Unsubscribe Done!"
                    });
                })
            } else {
                cmd.update({
                    "command": 'connector/unsubscribe',
                    "status": "ERROR",
                    "result": "Missing Device and service arguments!"
                })
            }
        }
    })
};

function removeClientSub(cmd, callback) {
    async.waterfall([
        async.apply(mongodb.findSub, {
            Device: cmd.parameters.Device,
            subService: cmd.parameters.service
        }),
        unsubscribe,
        mongodb.removeSub,
    ], function(err, res) {
        if (err)
            callback({
                "command": 'connector/unsubscribe',
                "status": "ERROR",
                "result": "Can't unsubscribe for device!"
            })
        else {
            callback(null);
        }
    })
}

function unsubscribe(args, callback) {
    //console.log(args);
    hive.client.unsubscribe(args.subID,
        function(err, res) {
            //console.log('UNSUBSCRIBING!');
            //console.log(res)
            if (err) callback(err)
            else callback(null, args)
        })
}

function addClientSub(cmd, callback) {
    //console.log("MAKE CLIENT SUB")
    hive.client.subscribe(
        function(err, subscription) {
            if (err)
                callback({
                    "command": 'connector/subscribe',
                    "status": "ERROR",
                    "result": "Can't subscribe for device!"
                })
            callback(null)
            //console.log(subscription);
            mongodb.addSub({
                Device: cmd.parameters.Device,
                notification: cmd.parameters.notification,
                subID: subscription.id,
                subService: cmd.parameters.service
            }, function(err, res) {
                if (err) console.log(err);
            })
            //console.log("SUBSCRIBE DONE")
            subscription.message(function(deviceIds, options) {
                //console.log(options)
                async.each(config.device_config.services_and_sub_paths,
                    function(service, callback) {
                        if (service.service == cmd.parameters.service) {
                            options.parameters.Device = deviceIds;
                            //console.log(options);
                            seneca.act(service.sub_path, options.parameters, function(err, res) {
                                if (err) callback(err);
                                callback(null);
                            });
                        } else {
                            callback(null);
                        }
                    },
                    function(err, res) {
                        if (err) console.log(err);
                    });
            });

        }, {
            subscription: {
                deviceIds: cmd.parameters.Device,
                names: cmd.parameters.notification,
                onMessage: cmd.parameters.notification
            }
        }
    );
};

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
};

function createClients(client, callback) {
    seneca.client(client);
    callback();
}
