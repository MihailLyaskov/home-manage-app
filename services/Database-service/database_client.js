//@flow weak
//"use strict";

var sqlite3 = require('sqlite3').verbose();

var db_client = function(){
  this.db = new sqlite3.Database('database');
}

db_client.prototype.startLog = function(seneca,params,callback){
  callback(null,{answer:"OK!"});
}

module.exports = db_client;
