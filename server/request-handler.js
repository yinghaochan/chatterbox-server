/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var fs = require('fs');
var _ = require('underscore');


var _storage = [];

var insertNewMessage = function(message) {
  message.createdAt = new Date();
  message.objectId = JSON.stringify(message);
  _storage.push(message);
};

var getMessages = function(room) {
  if(!room){return _storage;}
  var msgArr =  _.filter(_storage, function(value, key, list){
    return value.roomname === room;
  });
  return JSON.stringify({results: msgArr});
};

// insertNewMessage({
//       username: 'nick',
//       text: 'hello everyone',
//       roomname: 'homeroom'
//     });

// console.log(_storage);

var requestHandler = function(request, response) {
  // console.log('url: ' + request.url.split('?')[0] + '.');
  var _response = {
    status: 404,
    headers: {},
    write: undefined,
    end: undefined
  };
  // _response.headers["access-control-allow-headers"] = defaultCorsHeaders["access-control-allow-headers"];
  // debugger; 

  var parseUrl = function () {
    var url = request.url;
    url = url.split('?')[0];
    if(url === '/'){return serveHtml('/client/bbindex.html');}
    urlSplit = url.split('/');
    if(urlSplit[1] === 'classes') {
      return serveAjax(urlSplit[2]);
    }else{
      return serveHtml('/client' + url); 
    }
  };

  var serveHtml = function (address) {
    console.log(__dirname +  address);
    fs.readFile(address, function (err, data) {
      var header = {};
      header['Content-Type'] = "text/" + (address.split('.')[1] && 'html');
      response.writeHead(200, header);
      response.write = data;
      response.end();
      return;
    });
  };

var serveAjax = function (roomname) {
  if(request.method === 'GET'){
    _response.status = 200;
    _response.headers['Content-Type'] = "application/json"; 
    _response.end = getMessages(roomname);
  }else if(request.method === 'POST'){
    _response.status = 201;
    _response.headers['Content-Type'] = "text/plain";
    request.on('data', function (chunk) {
      var msgObj = JSON.parse(chunk.toString());
      if(!msgObj.roomname){ msgObj.roomname = roomname;}
      insertNewMessage(msgObj);
    });

  }
};

if(request.method === "OPTIONS"){
  _response.status = 200;
  _response.headers.Allow = 'GET,POST';
}else{
  parseUrl();
}

response.writeHead(_response.status, _response.headers);
if(_response.write) response.write(_response.write);
response.end? response.end(_response.end) : response.end();

};

//   console.log(request.method);

//   var headers = defaultCorsHeaders;

//   var url = request.url.split("/");


//   var statusCode = 404;
//   var outgoingBody = "404 - Not Found";
//   console.log(request.url);
//   switch(url[1]) {
//     case '':
//       console.log('serving status client files');
//       console.log(request.url);

//       fs.readFile('client/bbindex.html', function (err,data) {
//         // if (err) {
//         //   console.log(__dirname);
//         //   console.log('error '+err);
//         //   statusCode = 404;
//         //   outgoingBody =JSON.stringify(err);
//         //   return;
//         // }
//         // console.log(data.toString());
//         statusCode = 200;
//         headers['Content-Type'] = "text/html";
//         response.writeHead(statusCode, headers);
//         response.write(data);
//         response.end();
//         return;
//         // outgoingBody = data;
//       });

//       break;
//     case 'classes':
//       if(url[2] === 'messages'){
//         if(request.method === 'GET') {
//           console.log('getting messages');
//           statusCode = 200;
//           headers['Content-Type'] = "application/json";
//           outgoingBody = JSON.stringify({results:getMessages()});
//         } else if(request.method === 'POST') {
//           console.log('making new message');
//           statusCode = 201;
//           headers['Content-Type'] = "text/plain";
//           request.on('data', function(chunk) {
//             insertNewMessage(JSON.parse(chunk.toString()));
//           });

//           outgoingBody = 'inserted new message';
//         } else if(request.method === 'OPTIONS') {
//           statusCode = 200;
//           outgoingBody = "LOOK AT THE DOCS YOU FOOL!";
//           headers['Allow'] = 'GET,POST';
//         }
//         break;
//       }else{
//         if(request.method === 'GET') {
//           statusCode = 200;
//           headers['Content-Type'] = "application/json";
//           outgoingBody = JSON.stringify({results:getMessages(url[2])});
//         } else if(request.method === 'POST') {
//           statusCode = 201;
//           headers['Content-Type'] = "text/plain";
//           request.on('data', function (chunk) {
//             // console.log(chunk.toString);
//             chunk = JSON.parse(chunk.toString());
//             chunk.roomname = url[2];
//             insertNewMessage(chunk);
//           });
//         }
//       }
//       break;
//     case()
//     default:
//       fs.readFile('client/' + request.url, function (err, data) {
//         response.writeHead(200, {'Content-Type': 'text/' + request.url.split('.').reverse()[0]});
//         response.write(data);
//         response.end();
//         return; 
//       })
//       break;
//   }




//   // response.writeHead(statusCode, headers);
//   // response.end(outgoingBody);

// };


// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept, X-Parse-Application-Id, X-Parse-REST-API-Key",
  "access-control-max-age": 10 // Seconds.
};



exports.requestHandler = requestHandler;






















  // if(request.method === 'GET') {
  //   if(request.url === '/classes/messages/'){
  //     outgoingBody = JSON.stringify({results:getMessages()});
  //   }
  // } else if(request.method === 'POST') {
  //   if(request.url === '/classes/messages/'){
  //     request.on('data', function(chunk) {
  //       console.log("Received body data:");
  //       insertNewMessage(JSON.parse(chunk.toString()));
  //     });
  //     // insertNewMessage(request.data);
  //     outgoingBody = 'inserted new message';
  //   }
  // }
