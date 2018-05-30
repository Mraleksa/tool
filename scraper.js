var client = require('http-api-client');
//var d3 = require("d3");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("data.sqlite");


db.serialize(function() {
     //db.run("DELETE from data WHERE date(dateModified)>date('"+dateTime+"') ");
	db.run("DELETE from data WHERE date(dateSigned)<date('2017-10-01T10:32:30.371699+03:00') ");
})
db.close();


