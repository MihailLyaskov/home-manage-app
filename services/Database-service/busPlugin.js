//@flow weak
var Database = require('./database_client');
module.exports = function database(options){
  var seneca = this;
  var DB = new Database();
  this.add({role:'database', cmd:'startLog'},startLog);


  function startLog(args,done){
    DB.startLog(this,args.params,function(err,res){
      if(err) done(err);
      done(null,res);
    });
  }


}
