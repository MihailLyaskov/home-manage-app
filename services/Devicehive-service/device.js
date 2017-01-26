//@flow weak
global.XMLHttpRequest = require('xhr2');
global.WebSocket = require('ws');
const async = require('async');
const DeviceConnector = require('./lib/devicehive.device');
const ClientConnector = require('./lib/devicehive.client');
const _config = require('config');

module.exports = function Device(callback){
  async.waterfall([
    registerDevice,
    openChannelDevice,
    openChannelClient
  ],function(err,res){
    if(err) callback(err);
    callback(null,res);
  });
}

function registerDevice(callback){
  const DeviceConnection = new DeviceConnector(_config.DeviceHive.url,_config.device_config.guid,_config.DeviceHive.api_key);
  DeviceConnection.registerDevice(
  _config.device_config,function(err,res){
        if(err)
          callback(err,null);
        callback(null,DeviceConnection);
    });
}

function openChannelDevice(DeviceConnection,callback){
  DeviceConnection.openChannel(function(err, res){
    if(err)
      callback(err,null);
    callback(null,DeviceConnection);
  }, "websocket");
}

function openChannelClient(DeviceConnection,callback){
  const ClientConnection = new ClientConnector(_config.DeviceHive.url,_config.DeviceHive.api_key);
  ClientConnection.openChannel(function(err, res){
    if(err) callback(err,null);
    callback(null,{device:DeviceConnection,client:ClientConnection});
  }, "websocket");
}
