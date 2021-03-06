var db = require('./db.js');
var template = require('./template.js');
var url =  require('url');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

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

exports.page = function(request, response)
{
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query(`SELECT * FROM topic`, function(error,topics){
        if(error)
        {
          throw error;
        }
        //`SELECT * FROM topic WHERE id = ${queryData.id}` 사용자의 공격이 가능한 코드임...
        //?를 사용하여 치환하지 않으면 문자열이 아닌 코드가 그대로 들어갈수 있다.
        // code: 'ER_PARSE_ERROR' => query함수는 기본적으로 하나의 쿼리만 실행 가능하다 
        // => db사용전에 옵션에서 바꿔주면 여러쿼리 가능 multipleStatements:true
        //또다른 방법은 db.escape사용
        //var sql = `SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id = ${db.escape(queryData.id)}`;
        //console.log(sql);
        //var query = db.query(sql, function(error2,topic){
       var query = db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id = ?`,[queryData.id], function(error2,topic){
          if(error2)
          {
            throw error2;
          }
          console.log(topic);
          var title = topic[0].title;
          var description = topic[0].description;
          var list = template.list(topics);
          var html = template.html(title, list,
              `<h2>${sanitizeHtml(title)}</h2>
              ${sanitizeHtml(description)}
              <p>by ${sanitizeHtml(topic[0].name)}</p>`
              ,
              `<a href="/create">create</a>
               <a href="/update?id=${queryData.id}">update</a>
               <form action="delete_process" method="post">
                 <input type="hidden" name="id" value="${queryData.id}">
                 <input type="submit" value="delete">
               </form>`);
               console.log(query.sql);
          response.writeHead(200);
          response.end(html);

        });
      });
}

exports.create = function(request, response){
    db.query(`SELECT * FROM topic`, function(error,topics){
        if(error)
        {
          throw error;
        }
        db.query('SELECT * FROM author', function(error2,authors){
          if(error2)
          {
            throw error2;
          }
          var title = 'Create';
          var list = template.list(topics);
          var html = template.html(sanitizeHtml(title), list,
              `
              <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                ${template.authorSelect(authors)}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
              `,
              `<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(html);
        });
        
      });
}

exports.create_process = function(request, response){
    var body = '';
      request.on('data',function(data){
        body = body + data;
      });
      request.on('end',function(){
        var post  = qs.parse(body);
        // INSERT INTO topic (title, description, created, author_id)
        // VALUES('Nodejs' ,'Nodejs is ...', NOW(), 1);
          db.query(`
          INSERT INTO topic (title, description, created, author_id) 
          VALUES(?, ?, NOW(), ?)`,
          [post.title, post.description, post.author],
          function(error, result){
            if(error)
            {
              throw error;
            }
            response.writeHead(302, {Location: `/?id=${result.insertId}`});
            response.end();
          });
      });
}

exports.update = function(request, response)
{
    var _url = request.url;
    var queryData = url.parse(_url, true).query;

    db.query('SELECT * FROM topic', function(error,topics){
        // fs.readdir('./data', function(error, filelist)
        // {
          if(error)
          {
            throw error;
          }
          db.query(`SELECT * FROM topic WHERE id = ?`,[queryData.id], function(error2,topic){
            if(error2)
            {
              throw error2;
            }
            db.query('SELECT * FROM author', function(error3,authors){
              if(error3)
              {
                throw error3;
              }
              var list = template.list(topics);
              var html = template.html(sanitizeHtml(topic[0].title), list,
                `<form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                  <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(topic[0].title)}"></p>
                  <p>
                    <textarea name="description" placeholder="description">${sanitizeHtml(topic[0].description)}</textarea>
                  </p>
                  <p>
                    ${template.authorSelect(authors, topic[0].author_id)}
                  </p>
                  <p>
                    <input type="submit">
                  </p>
                </form>`,
                `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`);
                response.writeHead(200);
                response.end(html);
            });
            
          });
        });
}

exports.update_process = function(request, response)
{
    var body = '';
      request.on('data',function(data){
        body = body + data;
      });
      request.on('end',function(){
        var post = qs.parse(body);
        
        db.query('UPDATE topic SET title=?,description=?,author_id=? WHERE id=?',[post.title, post.description, post.author, post.id], function(error, result){
          response.writeHead(302, {Location: `/?id=${post.id}`});
          response.end();
        });
      });
}

exports.delete_process = function(request, response)
{
    var body = '';
      request.on('data',function(data){
        body = body + data;
      });
      request.on('end',function(){
        var post = qs.parse(body);
        db.query('DELETE FROM topic WHERE id = ?',[post.id], function(error,result){
          if(error)
          {
            throw error;
          }
          response.writeHead(302, {Location: `/`});
          response.end();
        });

      });
}