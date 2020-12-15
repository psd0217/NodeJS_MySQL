var db = require('./db.js');
var template = require('./template.js');

//module.exports 말고
exports.home= function(request,response){
    db.query(`SELECT * FROM topic`, function(error,topics){
        var title = 'Welcome2';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.html(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(html);
      });
}
