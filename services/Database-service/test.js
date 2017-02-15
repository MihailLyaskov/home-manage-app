var db = require('./db_client');
var DB = new db();

DB.logData({
    Device: 'espDe',
    power: 100,
    energy: 200
}, function(err, res) {
    if (err) console.log(err);
    console.log(res);
})
