var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'nodejs', //mysql -uroot -p
  password : '111111', //password
  database : 'opentutorials' 
});
 
connection.connect(); //USE opentutorials;
 
//SELECT * FROM topic
connection.query('SELECT * FROM topic', function (error, results, fields) {
  if (error)
  {
      console.log(error);
  }
  console.log(results);
});
 
//exit
connection.end();