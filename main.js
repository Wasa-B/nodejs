var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template ={
  HTML : (title,list,body,control = `<a href="/create">CREATE</a>`) => {
    var listTag = this.list(list);
    return `
        <!doctype html>
        <html>
        <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1><a href="/">WEB</a></h1>
          ${listTag}
          ${control}
          ${body}
        </body>
        </html>
        `;
  },
  list : (list)=>{
    var data = `<ol>`;
    for(let i=0; i<list.length;++i){
      data += `<li><a href="?id=${list[i]}">${list[i]}</a></li>`;
    }
    data += `</ol>`;
    return data;
  }
};

function ListToli(list){
  var data = `<ol>`;
  for(let i=0; i<list.length;++i){
    data += `<li><a href="?id=${list[i]}">${list[i]}</a></li>`;
  }
  data += `</ol>`;
  return data;
}


function templateHTML(title,list,body,control = `<a href="/create">CREATE</a>`){
  var listTag = ListToli(list);
  return `
      <!doctype html>
      <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        ${listTag}
        ${control}
        ${body}
      </body>
      </html>
      `;
}

var app = http.createServer(function(request,response){
  
  var _url = request.url;
  var queryData = url.parse(_url,true).query;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.id;

  if(pathname ==='/')
  {
    fs.readdir(`./data`,(err,filelist)=>{
      if(queryData.id === undefined){
        
        response.writeHead(200);
        response.end(template.HTML('Welcom',filelist,`<h2>Welcom</h2><p>Hello, Node.js</p>`));
      }else{
        fs.readFile(`data/${title}`,`utf-8`,(err,discription)=>{
          
          var template = templateHTML(title,filelist,`<h2>${title}</h2><p>${discription}</p>`,
          `<a href="/create">CREATE</a>
          <a href="/update?id=${title}">UPDATE</a>
          <form action="/process_delete" method="post"><input type="hidden" name="id" value = "${title}"><input type="submit" value="DELETE"></form>`);
          response.writeHead(200);
          response.end(template);
        });
      }
    });
  }
  else if(pathname ==='/create'){
    fs.readdir(`./data`,(err,filelist)=>{
        fs.readFile('form.html', `utf-8`, (err, form)=>{
          var template = templateHTML('Welcom',filelist,form,``);
        response.writeHead(200);
        response.end(template);
        });

        
    });
  }
  else if(pathname ==='/process_create'){
    var body ='';
    request.on('data',(data)=>{
      body+=data;
      //if(body.length > 1e6)
        //request.connection.destroy();
    });
    request.on('end', ()=>{
      var post = qs.parse(body); 
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`,description,`utf-8`,(err)=>{
        if(err) throw err; 
        response.writeHead(302,{Location : `/?id=${title}`});
        response.end();
      });
    });
  }
  else if(pathname ==='/update'){
    fs.readdir(`./data`,(err,filelist)=>{
      fs.readFile(`data/${queryData.id}`, `utf-8`, (err, description)=>{

        var form =`
        <form action="/process_update" method="post">
        <input type="hidden" name="id" value="${title}">
        <p>
            <h4>title </h4>
            <input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
            <h4>description </h4>
            <textarea name="description" placeholder="description" >${description}</textarea>
        </p>
        <p>
            <input type="submit">
        </p>
        </form>   
        `;
        var template = templateHTML('Welcom',filelist,form,``);
      response.writeHead(200);
      response.end(template);
      });

      
  });
  }
  else if(pathname === '/process_update'){
    var body ='';
    request.on('data',(data)=>{
      body+=data;
      //if(body.length > 1e6)
        //request.connection.destroy();
    });
    request.on('end', ()=>{
      var post = qs.parse(body); 
      var title = post.title;
      var id = post.id;
      var description = post.description;
      fs.rename(`data/${id}`,`data/${title}`,err=>{
        fs.writeFile(`data/${title}`,description,`utf-8`,(err)=>{
          if(err) throw err; 
          console.log('Saved.');
          response.writeHead(302,{Location : `/?id=${title}`});
          response.end();
        });
      });
    });
  }
  else if(pathname ==='/process_delete'){
    var body ='';
    request.on('data',(data)=>{
      body+=data;
      //if(body.length > 1e6)
        //request.connection.destroy();
    });
    request.on('end', ()=>{
      var post = qs.parse(body);
      var id = post.id;
      console.log(id);
      fs.unlink(`data/${id}`,err=>{response.writeHead(302,{Location : `/`});response.end();});
    });
  }
  else{
    response.writeHead(404);
    response.end('Not found');
  }

    //response.writeHead(200);
    //response.end(fs.readFileSync(__dirname + _url));
    //response.end(template);
    //response.end('Test');
});
app.listen(3000);