var mysql = require('mysql');

var db = mysql.createConnection({
    host : 'localhost',
    user : 'nodejs',
    password : '111111',
    database : 'opentutorials'
    //,multipleStatements:true  query 함수 실행시 여러개의 쿼리를 한번에 실행 할 수 있게 해줌
  });
  db.connect();

  module.exports = db;