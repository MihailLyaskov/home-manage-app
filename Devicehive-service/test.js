//@flow weak
var seneca = require('seneca')();
var role = 'role:database,cmd:logdata';
var subscribtionID = '';
seneca.client({port:10101})
  .listen({port:10102,pin:'role:database'})

seneca.add(role,logData);

function logData(args,done){
  console.log(args);
  done(null,{message:' done'})
};

/*seneca.act(
  {
    role: 'client',
    cmd: 'subscribe',
    params: {DeviceID:'d-link-switch',notificationName:'dlink/init',onMessage:'dlink/init',callservice:role}},
    function ( err, result ) {
      console.log( result );
      subscribtionID = result.id;
    }
);

setTimeout(function(){
  seneca.act({role: 'client',cmd: 'unsubscribe',params:{subscriptionId:subscribtionID}},function(err,result){
    if(err)console.log(err)
    console.log(result);
  })
},30000);
*/
