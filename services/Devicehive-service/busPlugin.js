//@flow weak
module.exports = function hiveConnector(options){
  var seneca = this;
  this.add({role:'device', cmd:'sendNotification'},sendNotification);
  this.add({role:'client', cmd:'sendCommand'},sendCommand);
  this.add({role:'client', cmd:'subscribe'},subscribe);
  this.add({role:'client', cmd:'unsubscribe'},unsubscribe);
  this.add({role:'client', cmd:'getDevice'},getDevice);

  function sendNotification(args,done){
    options.device.sendNotification(args.params.notificationName,args.params.data,function(err,res){
      if(err) done(err);
      done(null,res);
    });
  }

  function sendCommand(args,done){
    options.client.sendCommand(args.params.DeviceID, args.params.command,args.params,function(err,res){
      if(err) done(err);
      done(null,res);
    });
  }

  function subscribe(args,done){
    //console.log(args);
    options.client.subscribe(function(err,res){
      if(err) done(err);
      done(null,{DeviceID:res.deviceIds[0],id:res.id});
      res.message(function(DeviceIds,options){
        seneca.act(args.params.callservice+',data:'+JSON.stringify(options.parameters),function(err,result){
          if(err)console.log(err)
        });
      });
    },{deviceIds:args.params.DeviceID,names:args.params.notificationName,onMessage:args.params.onMessage});
  }

  function unsubscribe(args,done){
    options.client.unsubscribe(args.params.subscriptionId,function(err,res){
      if(err) done(err);
      //console.log(res);
      done(null,{answer:'Done'});
    });
  }

  function getDevice(args,done){
    options.client.getDevice(args.params.DeviceID,function(err,res){
      if(err) done(err);
      //console.log(res);
      done(null,res);
    });
  }

}
